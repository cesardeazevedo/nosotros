import type { QueryClient } from '@tanstack/react-query'
import { eventFromNIP19QueryOptions } from '../query/useQueryBase'
import { eventRepliesQueryOptions } from '../query/useReplies'

export async function loadThreads(queryClient: QueryClient, nip19: string) {
  const events = await queryClient.fetchQuery(eventFromNIP19QueryOptions(nip19))
  if (events[0]) {
    await queryClient.fetchQuery(eventRepliesQueryOptions(events[0]))
  }
}
