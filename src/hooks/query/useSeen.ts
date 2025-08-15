import type { SeenDB } from '@/db/types'
import { dbSqlite } from '@/nostr/db'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

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
