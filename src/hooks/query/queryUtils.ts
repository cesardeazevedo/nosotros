import { addReplyAtom } from '@/atoms/replies.atoms'
import { store } from '@/atoms/store'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { dbSqlite } from '@/nostr/db'
import { isParameterizedReplaceableKind, isReplaceableKind } from 'nostr-tools/kinds'
import { queryClient } from './queryClient'
import { queryKeys } from './queryKeys'

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

export function setEventData(event: NostrEventDB) {
  if (event.kind === Kind.RelayDiscovery) {
    return
  }
  if (isReplaceableKind(event.kind)) {
    queryClient.setQueryData(queryKeys.replaceable(event.kind, event.pubkey), [event])
  } else if (isParameterizedReplaceableKind(event.kind)) {
    const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1]
    if (dTag) {
      queryClient.setQueryData(queryKeys.addressable(event.kind, event.pubkey, dTag), [event])
    }
  } else {
    queryClient.setQueryData(queryKeys.event(event.id), [event])
  }

  if (event.kind === Kind.Text || event.kind === Kind.Comment) {
    store.set(addReplyAtom, event)
  }
}
