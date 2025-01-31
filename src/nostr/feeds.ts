import { Kind } from '@/constants/kinds'
import type { PaginationLimitSubject } from '@/core/PaginationLimitSubject'
import type { PaginationSubject } from '@/core/PaginationRangeSubject'
import type { NostrFilter } from '@/core/types'
import { EMPTY, filter, from, mergeMap } from 'rxjs'
import type { ClientSubOptions, NostrClient } from './nostr'
import { metadataSymbol } from './types'

type Pagination = PaginationSubject | PaginationLimitSubject

export type FeedOptions = ClientSubOptions & {
  includeParents?: boolean
  includeReplies?: boolean
}

export class NostrFeeds {
  constructor(private client: NostrClient) {}

  private subscribe(filters: NostrFilter, options?: FeedOptions) {
    return from(filters.kinds || []).pipe(
      mergeMap((kind) => {
        switch (kind) {
          case Kind.Text: {
            const sub =
              options?.includeParents === false
                ? this.client.notes.subNotesWithRelated.bind(this.client.notes)
                : this.client.notes.subRelatedNotesWithParent.bind(this.client.notes)
            return sub({ ...filters, kinds: [Kind.Text] }, options).pipe(
              filter((note) => {
                const isRoot = note[metadataSymbol].isRoot
                if (options?.includeReplies === false && !isRoot) return false
                if (options?.includeReplies === true && isRoot) return false
                return true
              }),
            )
          }
          case Kind.Article: {
            return options?.includeReplies !== false
              ? this.client.articles
                  .subscribe({ ...filters, kinds: [Kind.Article] }, options)
                  .pipe(this.client.notes.withRelatedNotes(options))
              : EMPTY
          }
          case Kind.Repost: {
            return this.client.reposts.subscribeWithRepostedEvent(filters, options)
          }
          default: {
            return EMPTY
          }
        }
      }),
    )
  }

  self(filter$: Pagination, options?: FeedOptions) {
    return filter$.pipe(mergeMap((filter) => this.subscribe(filter, options)))
  }

  following(pagination$: Pagination, options?: FeedOptions) {
    const currentAuthor = pagination$.authors[0]
    return this.client.follows.subscribe(currentAuthor, options).pipe(
      mergeMap((event) => {
        const authors = [currentAuthor, ...(event[metadataSymbol].tags.get('p') || [])]
        return pagination$.setFilter({ authors })
      }),
      mergeMap((filter) => this.subscribe(filter, options)),
    )
  }
}
