import type { QueryClient } from '@tanstack/react-query'
import { eventFromNIP19QueryOptions } from '../query/useQueryBase'

export async function loadThreads(queryClient: QueryClient, nip19: string) {
  await queryClient.fetchQuery(eventFromNIP19QueryOptions(nip19))
}
