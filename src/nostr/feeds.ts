import { Kind } from '@/constants/kinds'
import type { PaginationSubject } from '@/core/PaginationRangeSubject'
import type { NostrFilter } from '@/core/types'
import { EMPTY, filter, from, mergeMap } from 'rxjs'
import type { ClientSubOptions, NostrClient } from './nostr'
import { metadataSymbol } from './types'

export type FeedOptions = ClientSubOptions & {
  includeRoot?: boolean
  includeReplies?: boolean
  includeReposts?: boolean
  includeParents?: boolean
}

export class NostrFeeds {
  constructor(private client: NostrClient) {}

  private subscribe(filters: NostrFilter, options?: FeedOptions) {
    return from(filters.kinds || []).pipe(
      mergeMap((kind) => {
        switch (kind) {
          case Kind.Text: {
            return this.client.notes.subRelatedNotesWithParent(filters, options).pipe(
              filter((event) => {
                const metadata = event[metadataSymbol]
                if (options?.includeReplies && metadata.isRoot) return false
                return true
              }),
            )
          }
          case Kind.Repost: {
            return options?.includeReposts ? this.client.reposts.subscribeWithRepostedEvent(filters) : EMPTY
          }
          default: {
            return EMPTY
          }
        }
      }),
    )
  }

  self(filter$: PaginationSubject, options?: FeedOptions) {
    return filter$.pipe(mergeMap((filter) => this.subscribe(filter, options)))
  }

  following(pagination$: PaginationSubject, options?: FeedOptions) {
    const currentAuthor = pagination$.authors[0]
    return this.client.follows.subscribe(currentAuthor, options).pipe(
      // Set the filter authors with the `follows` list
      mergeMap((event) => {
        const metadata = event[metadataSymbol]
        const authors = [...(metadata.tags.get('p') || [])]
        return pagination$.setFilter({
          authors: [currentAuthor, ...authors],
        })
      }),
      // Start notes subscription
      mergeMap((filter) => this.subscribe(filter, options)),
    )
  }
}
