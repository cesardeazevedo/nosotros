import { dbSqlite } from '@/nostr/db'
import { QueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      staleTime: Infinity,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: false,
    },
  },
})

async function populateRelayInfo() {
  const res = await dbSqlite.queryRelayInfo([])
  res.forEach((info) => queryClient.setQueryData(queryKeys.relayInfo(info.url), info))
}

async function populateRelayStats() {
  const res = await dbSqlite.queryRelayStats([])
  queryClient.setQueryData(queryKeys.allRelayStats(), res)
  Object.values(res).forEach((stats) => queryClient.setQueryData(queryKeys.relayStats(stats.url), stats))
}

export async function prepopulate() {
  return Promise.all([populateRelayInfo(), populateRelayStats()])
}

prepopulate()
