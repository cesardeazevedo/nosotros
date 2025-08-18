import type { SeenDB } from '@/db/types'
import { dbSqlite } from '@/nostr/db'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
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

export function useSeen(id: string, options?: Omit<UseQueryOptions<SeenDB[]>, 'queryKey'>) {
  return useQuery({
    ...options,
    enabled: !!id,
    queryKey: queryKeys.seen(id),
    queryFn: () => {
      return dbSqlite.querySeen(id)
    },
  })
}
