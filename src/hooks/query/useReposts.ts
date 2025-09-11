import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { eventAddress } from '@/utils/nip19'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import type { CustomQueryOptions } from './useQueryBase'
import { eventQueryOptions } from './useQueryBase'
import { useMemo } from 'react'

export function eventRepostsQueryOptions(event: NostrEventDB, options?: CustomQueryOptions) {
  const address = eventAddress(event)
  const id = address || event.id
  const tagFilter = address ? { '#a': [address] } : { '#e': [event.id] }
  return eventQueryOptions({
    queryKey: queryKeys.tag(address ? 'a' : 'e', [id], Kind.Repost),
    filter: {
      kinds: [Kind.Repost],
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

export function useReposts(event: NostrEventDB, options?: CustomQueryOptions) {
  return useQuery(eventRepostsQueryOptions(event, options))
}

export function useRepostsByPubkey(pubkey: string | undefined, event: NostrEventDB) {
  const reactions = useReposts(event)
  return useMemo(() => {
    return pubkey ? reactions.data?.find((event) => event.pubkey === pubkey) : undefined
  }, [pubkey, reactions.data])
}
