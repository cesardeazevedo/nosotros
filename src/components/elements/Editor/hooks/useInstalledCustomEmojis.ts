import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryKeys } from '@/hooks/query/queryKeys'
import { createEventQueryOptions, replaceableEventQueryOptions } from '@/hooks/query/useQueryBase'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

type Options = {
  enabled?: boolean
}

export function useInstalledCustomEmojis(options: Options = {}) {
  const { enabled = true } = options
  const pubkey = useCurrentPubkey()
  const emojiListQuery = useQuery(
    replaceableEventQueryOptions(Kind.Emojis, pubkey || '', {
      enabled: enabled && !!pubkey,
    }),
  )

  const emojiSetAddresses = useMemo(() => {
    return (emojiListQuery.data?.tags || [])
      .filter((tag) => tag[0] === 'a' && tag[1])
      .map((tag) => tag[1])
      .filter((address, index, list) => list.indexOf(address) === index)
  }, [emojiListQuery.data?.tags])

  const emojiSetsQuery = useQueries({
    queries: emojiSetAddresses.map((address) => {
      const [kind, author, identifier] = address.split(':')
      return createEventQueryOptions<NostrEventDB | undefined>({
        queryKey: queryKeys.addressable(parseInt(kind), author, identifier),
        filter: {
          kinds: [parseInt(kind)],
          authors: [author],
          '#d': [identifier],
        },
        enabled: enabled && !!kind && !!author && !!identifier,
        select: (events) => events[0],
        ctx: {
          network: 'STALE_WHILE_REVALIDATE',
        },
      })
    }),
  })

  const emojiMap = useMemo(() => {
    const tagsByName = new Map<string, string>()
    for (const result of emojiSetsQuery) {
      const event = result.data
      if (!event) continue
      for (const tag of event.tags) {
        if (tag[0] === 'emoji' && tag[1] && tag[2] && !tagsByName.has(tag[1])) {
          tagsByName.set(tag[1], tag[2])
        }
      }
    }
    return tagsByName
  }, [emojiSetsQuery])

  const customEmojis = useMemo(() => {
    return [...emojiMap.entries()].map(([name, imgUrl]) => ({
      id: name,
      names: [name],
      imgUrl,
    }))
  }, [emojiMap])

  return {
    emojiMap,
    customEmojis,
  }
}
