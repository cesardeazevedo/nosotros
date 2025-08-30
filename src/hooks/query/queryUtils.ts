import { addReplyAtom } from '@/atoms/replies.atoms'
import { store } from '@/atoms/store'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { dbSqlite } from '@/nostr/db'
import { queryClient } from './queryClient'
import { eventToQueryKey, queryKeys } from './queryKeys'

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

export async function setEventData(event: NostrEventDB) {
  // We don't need to keep track of these events individually
  if ([Kind.RelayDiscovery, Kind.Reaction].includes(event.kind)) {
    return
  }
  if (event.kind === Kind.Text || event.kind === Kind.Comment) {
    store.set(addReplyAtom, event)
  }
  const queryKey = eventToQueryKey(event)
  if (queryKey) {
    queryClient.setQueryData(queryKey, [event])
  }
}
