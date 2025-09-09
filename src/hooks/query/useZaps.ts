import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { eventAddress } from '@/utils/nip19'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queryKeys } from './queryKeys'
import type { CustomQueryOptions } from './useQueryBase'
import { eventQueryOptions } from './useQueryBase'

export function eventZapsQueryOptions(event: NostrEventDB, options?: CustomQueryOptions) {
  const address = eventAddress(event)
  const id = address || event.id
  const tagFilter = address ? { '#a': [address] } : { '#e': [event.id] }
  return eventQueryOptions({
    queryKey: queryKeys.tag(address ? 'a' : 'e', [id], Kind.ZapReceipt),
    filter: {
      kinds: [Kind.ZapReceipt],
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

export function useZaps(event: NostrEventDB, options?: CustomQueryOptions) {
  return useQuery(eventZapsQueryOptions(event, options))
}

export function useZapsByPubkey(pubkey: string | undefined, event: NostrEventDB) {
  const zaps = useZaps(event)
  return useMemo(() => {
    return pubkey
      ? zaps.data?.find((event) => {
          const zapper = event.tags.find((tag) => tag[0] === 'P')?.[1] || event.pubkey
          return zapper === pubkey
        })
      : undefined
  }, [pubkey, zaps.data])
}
