import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { EMPTY, filter, from, mergeMap } from 'rxjs'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { metadataSymbol } from '../types'
import { subscribeArticles } from './subscribeArticles'
import { subscribeMedia } from './subscribeMedia'
import { subscribeNotesWithParent, subscribeNotesWithRelated } from './subscribeNotes'
import { subscribeReposts } from './subscribeReposts'
import { withRelatedNotes } from './withRelatedNotes'

export type FeedOptions = ClientSubOptions & {
  includeParents?: boolean
  includeReplies?: boolean
}

export function subscribeFeed(filters: NostrFilter, client: NostrClient, options?: FeedOptions) {
  return from(filters.kinds || []).pipe(
    mergeMap((kind) => {
      switch (kind) {
        case Kind.Text: {
          const sub = options?.includeParents === false ? subscribeNotesWithRelated : subscribeNotesWithParent
          return sub({ ...filters, kinds: [Kind.Text] }, client, options).pipe(
            filter((note) => {
              const isRoot = note[metadataSymbol].isRoot
              if (options?.includeReplies === false && !isRoot) return false
              if (options?.includeReplies === true && !options?.includeParents && isRoot) return false
              return true
            }),
          )
        }
        case Kind.Article: {
          return options?.includeReplies !== false
            ? subscribeArticles(filters, client, options).pipe(withRelatedNotes(client, options))
            : EMPTY
        }
        case Kind.Media: {
          return subscribeMedia(client, { ...filters, kinds: [Kind.Media] }, options)
        }
        case Kind.Repost: {
          return subscribeReposts(filters, client, options)
        }
        default: {
          return EMPTY
        }
      }
    }),
  )
}
