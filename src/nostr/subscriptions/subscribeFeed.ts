import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { EMPTY, filter, from, identity, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import { metadataSymbol } from '../types'
import { subscribeArticles } from './subscribeArticles'
import { subscribeMedia } from './subscribeMedia'
import { subscribeNotesWithParent, subscribeNotesWithRelated } from './subscribeNotes'
import { subscribeRelayDiscorvery } from './subscribeRelayDiscovery'
import { subscribeReposts } from './subscribeReposts'
import { subscribeSearch } from './subscribeSearch'
import { withRelatedNotes } from './withRelatedNotes'

export type FeedOptions = {
  includeRoot?: boolean
  includeParents?: boolean
  includeReplies?: boolean
}

export function subscribeFeed(filters: NostrFilter, baseCtx: NostrContext, options?: FeedOptions) {
  const ctx = {
    ...baseCtx,
    outbox: true,
    queryDB: false,
  } as NostrContext
  return from(filters.kinds || []).pipe(
    mergeMap((kind) => {
      switch (kind) {
        case Kind.Metadata: {
          // feed when searching users
          if (filters.search) {
            return subscribeSearch(filters.search, 100).pipe(mergeMap(identity))
          }
          return EMPTY
        }
        case Kind.Text: {
          const sub = options?.includeParents === false ? subscribeNotesWithRelated : subscribeNotesWithParent
          return sub(filters, ctx).pipe(
            filter((note) => {
              const isRoot = note[metadataSymbol].isRoot
              if (options?.includeRoot === false && isRoot) return false
              if (options?.includeReplies === false && !isRoot) return false
              return true
            }),
          )
        }
        case Kind.Article: {
          return subscribeArticles(filters, ctx).pipe(withRelatedNotes(ctx))
        }
        case Kind.Media: {
          return subscribeMedia(filters, ctx)
        }
        case Kind.Repost: {
          return subscribeReposts(filters, ctx)
        }
        case Kind.RelayDiscovery: {
          return subscribeRelayDiscorvery(filters, ctx)
        }
        default: {
          return EMPTY
        }
      }
    }),
  )
}
