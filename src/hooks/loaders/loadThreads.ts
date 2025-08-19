import type { QueryClient } from '@tanstack/react-query'
import { eventFromNIP19QueryOptions } from '../query/useQueryBase'
import { eventRepliesByIdQueryOptions, eventRepliesQueryOptions } from '../query/useReplies'

export async function loadThreads(queryClient: QueryClient, nip19: string) {
  const events = await queryClient.fetchQuery(eventFromNIP19QueryOptions(nip19))
  const event = events[0]
  if (event) {
    const rootId = event.metadata?.rootId
    if (!rootId) {
      await queryClient.fetchQuery(eventRepliesQueryOptions(event))
    } else {
      await queryClient.fetchQuery(eventRepliesByIdQueryOptions(rootId))
    }
  }
}
