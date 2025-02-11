import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { EMPTY, filter, from, identity, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import { metadataSymbol } from '../types'
import { subscribeArticles } from './subscribeArticles'
import { subscribeMedia } from './subscribeMedia'
import { subscribeNotesWithParent, subscribeNotesWithRelated } from './subscribeNotes'
import { subscribeReposts } from './subscribeReposts'
import { withRelatedNotes } from './withRelatedNotes'
import { subscribeSearch } from './subscribeSearch'

export type FeedOptions = {
  includeParents?: boolean
  includeReplies?: boolean
}

export function subscribeFeed(filters: NostrFilter, ctx: NostrContext, options?: FeedOptions) {
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
          return sub({ ...filters, kinds: [Kind.Text] }, ctx).pipe(
            filter((note) => {
              const isRoot = note[metadataSymbol].isRoot
              if (options?.includeReplies === false && !isRoot) return false
              if (options?.includeReplies === true && !options?.includeParents && isRoot) return false
              return true
            }),
          )
        }
        case Kind.Article: {
          return options?.includeReplies !== false ? subscribeArticles(filters, ctx).pipe(withRelatedNotes(ctx)) : EMPTY
        }
        case Kind.Media: {
          return subscribeMedia({ ...filters, kinds: [Kind.Media] }, ctx)
        }
        case Kind.Repost: {
          return subscribeReposts(filters, ctx)
        }
        default: {
          return EMPTY
        }
      }
    }),
  )
}
