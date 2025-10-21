import type { SeenDB } from '@/db/types'
import { dbSqlite } from '@/nostr/db'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queryClient } from './queryClient'
import { queryKeys } from './queryKeys'

export function setSeenData(eventId: string, relay: string) {
  queryClient.setQueryData(queryKeys.seen(eventId), (old: SeenDB[] = []) => {
    if (!old.some((seen) => seen.relay === relay)) {
      return [...old, { relay, eventId }] as SeenDB[]
    }
    return old
  })
}

export function seenQueryOptions(
  eventId: string | undefined,
  options?: Omit<UseQueryOptions<SeenDB[]>, 'queryKey'>,
): UseQueryOptions<SeenDB[]> {
  return {
    queryKey: queryKeys.seen(eventId || ''),
    queryFn: () => dbSqlite.querySeen(eventId || ''),
    enabled: !!eventId,
    ...options,
  }
}

export function useSeen(eventId: string, options?: Omit<UseQueryOptions<SeenDB[]>, 'queryKey'>) {
  return useQuery(seenQueryOptions(eventId, options))
}

export function useSeenRelays(eventId: string) {
  const seenQuery = useSeen(eventId)
  return useMemo(() => seenQuery.data?.map((seen) => seen.relay) || [], [seenQuery.data])
}

export function useFirstSeenRelay(eventId: string) {
  const seenQuery = useSeen(eventId)
  return seenQuery.data?.[0]?.relay
}
