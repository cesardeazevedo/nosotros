import { addReplyAtom } from '@/atoms/replies.atoms'
import { store } from '@/atoms/store'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { dbSqlite } from '@/nostr/db'
import { dedupeById } from '@/utils/utils'
import type { QueryKey } from '@tanstack/react-query'
import type { NostrEvent } from 'nostr-tools'
import { queryClient } from './queryClient'
import { eventToQueryKey, queryKeys } from './queryKeys'
import type { InfiniteEvents } from './useQueryFeeds'
import { parseEventMetadata } from '../parsers/parseEventMetadata'

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
  switch (event.kind) {
    // We don't need to keep track of these events individually
    case Kind.RelayMonitor:
    case Kind.Reaction: {
      return
    }
    case Kind.Text:
    case Kind.Comment: {
      store.set(addReplyAtom, event)
      break
    }
    // add the repost event
    case Kind.Repost: {
      if (event.content && event.content !== '{}') {
        const inner = JSON.parse(event.content) as NostrEvent
        const parsed = parseEventMetadata(inner)
        const queryKey = eventToQueryKey(event)
        if (queryKey) {
          queryClient.setQueryData(queryKey, [parsed])
        }
      }
      break
    }
  }
  const queryKey = eventToQueryKey(event)
  if (queryKey) {
    queryClient.setQueryData(queryKey, [event])
  }
}

export function prependEventFeed(queryKey: QueryKey, events: Array<NostrEvent | NostrEventDB>) {
  queryClient.setQueryData(queryKey, (data: InfiniteEvents | undefined) => {
    if (data) {
      return {
        ...data,
        pages: [
          dedupeById([...events.toSorted((a, b) => b.created_at - a.created_at), ...data.pages[0]]),
          ...data.pages.slice(1),
        ],
      }
    }
    return data
  })
}

export function appendEventFeed(queryKey: QueryKey, events: NostrEventDB[]) {
  queryClient.setQueryData(queryKey, (data: InfiniteEvents | undefined) => {
    if (data) {
      const pages = [...data.pages.slice(0, -1), dedupeById([...data.pages[data.pages.length - 1], ...events])]
      return {
        pageParams: data.pageParams,
        pages,
      }
    }
    return data
  })
}

export function removeEventFromFeed(queryKey: QueryKey, eventId: string) {
  queryClient.setQueryData(queryKey, (data: InfiniteEvents | undefined) => {
    if (data) {
      const pages = [data.pages.flat().filter((e) => e.id !== eventId)]
      return {
        pageParams: data.pageParams,
        pages,
      }
    }
    return data
  })
}

export function removeEventFromQuery(queryKey: QueryKey, eventId: string) {
  queryClient.setQueryData(queryKey, (data: NostrEvent[]) => {
    if (data) {
      return [data.filter((e) => e.id !== eventId)]
    }
    return data
  })
}
