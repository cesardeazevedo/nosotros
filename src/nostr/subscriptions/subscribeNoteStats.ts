import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'
import type { Observable } from 'rxjs'
import { EMPTY, from, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
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

  if (isAddressable) {
    const d = event.tags.find((x) => x[0] === 'd')?.[1]
    if (d) {
      const address = `${event.kind}:${event.pubkey}:${d}`
      filters.push({ kinds: [...kinds, Kind.Comment], '#a': [address] })
    }
  }
  filters.push({ kinds, '#e': [event.id] })
  if (event.kind !== Kind.Text && options?.replies) {
    filters.push({ kinds: [Kind.Comment], '#E': [event.id] })
  }
  return filters
}

export function subscribeNoteStats(
  event: NostrEvent,
  ctx: NostrContext,
  settings: NoteStatsOptions,
): Observable<NostrEvent> {
  const filters = buildFilters(event, settings)
  return from(filters).pipe(
    mergeMap((filter) => {
      const { kinds, ...rest } = filter
      const key = Object.keys(rest)?.[0]
      return from(kinds || []).pipe(
        mergeMap((kind) => {
          const id = event.id + key
          switch (kind) {
            case Kind.Text: {
              return subscribeRepliesFromId(id, rest, ctx)
            }
            case Kind.Comment: {
              return subscribeCommentsFromId(id, rest, ctx)
            }
            case Kind.Reaction: {
              return subscribeReactionsFromId(id, rest, ctx)
            }
            case Kind.Repost: {
              return subscribeRepostsFromId(id, rest, ctx)
            }
            case Kind.ZapReceipt: {
              return subscribeZapsFromId(id, rest, ctx)
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
