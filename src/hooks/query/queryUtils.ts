import { addDeletionEventsAtom } from '@/atoms/deletion.atoms'
import { addReplyAtom } from '@/atoms/repliesCount.atoms'
import { store } from '@/atoms/store'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { dedupeById } from '@/utils/utils'
import type { QueryKey } from '@tanstack/react-query'
import type { NostrEvent } from 'nostr-tools'
import { parseEventMetadata } from '../parsers/parseEventMetadata'
import { queryClient } from './queryClient'
import { eventToQueryKey, queryKeys } from './queryKeys'
import type { InfiniteEvents } from './useQueryFeeds'

const deleteEventRequested = (queryKey: readonly unknown[], ownerPubkey: string) => {
  queryClient.setQueryData(queryKey, (data: unknown) => {
    const target = (Array.isArray(data) ? data[0] : data) as { pubkey?: string } | undefined
    return target?.pubkey === ownerPubkey ? null : data
  })
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
    case Kind.EventDeletion: {
      store.set(addDeletionEventsAtom, [event])
      for (const tag of event.tags) {
        switch (tag[0]) {
          case 'e': {
            if (tag[1]) deleteEventRequested(queryKeys.event(tag[1]), event.pubkey)
            break
          }
          case 'a': {
            const [kindRaw, pubkey, dTag] = (tag[1] || '').split(':')
            const kind = Number(kindRaw)
            if (pubkey === event.pubkey && dTag.length) {
              deleteEventRequested(queryKeys.event(tag[1]), event.pubkey)
              deleteEventRequested(queryKeys.addressable(kind, pubkey, dTag), event.pubkey)
            }
            break
          }
          default:
            break
        }
      }
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

export function appendEventToQuery(queryKey: QueryKey, events: NostrEventDB[]) {
  queryClient.setQueryData(queryKey, (data: NostrEventDB[] | undefined) => {
    return dedupeById([...(data || []), ...events])
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
      return data.filter((e) => e.id !== eventId)
    }
    return data
  })
}
