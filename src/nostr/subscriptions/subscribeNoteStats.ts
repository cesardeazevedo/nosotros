import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'
import type { Observable } from 'rxjs'
import { EMPTY, from, mergeMap } from 'rxjs'
import type { NostrClient } from '../nostr'
import { subscribeCommentsFromId } from './subscribeCommentsFromId'
import { subscribeReactionsFromId } from './subscribeReactionsFromId'
import { subscribeRepliesFromId } from './subscribeRepliesFromId'
import { subscribeRepostsFromId } from './subscribeRepostsFromId'
import { subscribeZapsFromId } from './subscribeZapsFromId'

export type NoteStatsOptions = {
  zaps?: boolean
  replies?: boolean
  reactions?: boolean
  reposts?: boolean
}

const withKind = (kind: Kind, enabled?: boolean) => (enabled !== false ? [kind] : [])

export function buildFilters(event: NostrEvent, options: NoteStatsOptions) {
  const isAddressable = isParameterizedReplaceableKind(event.kind)
  const kinds = [
    ...withKind(Kind.Reaction, options.reactions),
    ...withKind(Kind.Repost, options.reposts),
    ...withKind(Kind.ZapReceipt, options.zaps),
    // we are making an exception to fetch kind1 replies for articles
    ...withKind(Kind.Text, options.replies && (event.kind === Kind.Text || event.kind === Kind.Article)),
    ...withKind(Kind.Comment, options.replies && event.kind !== Kind.Text),
  ].sort()

  const filters = [] as NostrFilter[]
  // removed since parameter for now
  // const since = options?.lastSyncedAt ? { since: options.lastSyncedAt } : {}

  if (isAddressable) {
    const d = event.tags.find((x) => x[0] === 'd')?.[1]
    if (d) {
      const address = `${event.kind}:${event.pubkey}:${d}`
      filters.push({ kinds: [...kinds, Kind.Comment], '#a': [address] })
    }
  }
  filters.push({ kinds, '#e': [event.id] })
  return filters
}

export function subscribeNoteStats(
  client: NostrClient,
  event: NostrEvent,
  options: NoteStatsOptions,
): Observable<NostrEvent> {
  const filters = buildFilters(event, options)
  return from(filters).pipe(
    mergeMap((filter) => {
      const { kinds, ...rest } = filter
      const key = Object.keys(rest)?.[0]
      return from(kinds || []).pipe(
        mergeMap((kind) => {
          const id = event.id + key
          switch (kind) {
            case Kind.Text: {
              return subscribeRepliesFromId(id, rest, client)
            }
            case Kind.Comment: {
              return subscribeCommentsFromId(id, rest, client)
            }
            case Kind.Reaction: {
              return subscribeReactionsFromId(id, rest, client)
            }
            case Kind.Repost: {
              return subscribeRepostsFromId(id, rest, client)
            }
            case Kind.ZapReceipt: {
              return subscribeZapsFromId(id, rest, client)
            }
            default: {
              return EMPTY
            }
          }
        }),
      )
    }),
  )
}
