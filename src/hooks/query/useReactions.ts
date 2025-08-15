import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { eventAddress } from '@/utils/nip19'
import { fallbackEmoji } from '@/utils/utils'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queryKeys } from './queryKeys'
import type { CustomQueryOptions } from './useQueryBase'
import { eventQueryOptions } from './useQueryBase'
import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'

export function eventReactionsQueryOptions<Selector>(event: NostrEventDB, options?: CustomQueryOptions<Selector>) {
  const address = eventAddress(event)
  const id = address || event.id
  const tagFilter = address ? { '#a': [address] } : { '#e': [event.id] }
  return eventQueryOptions({
    queryKey: queryKeys.tag(address ? 'a' : 'e', [id], Kind.Reaction),
    filter: {
      kinds: [Kind.Reaction],
      ...tagFilter,
    },
    ctx: {
      network: 'STALE_WHILE_REVALIDATE_BATCH',
      relayHints: {
        idHints: {
          [id]: [event.pubkey],
        },
      },
    },
    ...options,
  })
}

export function useReactions<Selector = NostrEventDB[]>(event: NostrEventDB, options?: CustomQueryOptions<Selector>) {
  return useQuery(eventReactionsQueryOptions(event, options))
}

export function useReactionByPubkey(pubkey: string | undefined, event: NostrEventDB) {
  const reactions = useReactions(event)
  return useMemo(() => {
    return pubkey ? reactions.data?.find((event) => event.pubkey === pubkey) : undefined
  }, [pubkey, reactions.data])
}

export function useReactionsGrouped(event: NostrEventDB) {
  return useReactions(event, {
    select: (events) => {
      return Object.entries(
        events.reduce(
          (acc, event) => {
            const content = fallbackEmoji(event.content)
            return {
              ...acc,
              [content]: [...(acc?.[content] || []), event.pubkey],
            }
          },
          {} as Record<string, string[]>,
        ),
      ).sort((a, b) => b[1].length - a[1].length)
    },
  })
}
