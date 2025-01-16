import { Kind } from '@/constants/kinds'
import type { PaginationSubject } from '@/core/PaginationRangeSubject'
import type { NostrFilter } from '@/core/types'
import { EMPTY, filter, from, mergeMap } from 'rxjs'
import type { ClientSubOptions, NostrClient } from './nostr'
import { metadataSymbol } from './types'

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
            return sub(filters, options).pipe(
              filter((note) => {
                return options?.includeReplies === false ? note[metadataSymbol].isRoot : !note[metadataSymbol].isRoot
              }),
            )
          }
          case Kind.Article: {
            return options?.includeReplies !== false
              ? this.client.articles.subscribe(filters, options).pipe(this.client.notes.withRelatedNotes(options))
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
