import { Kind } from '@/constants/kinds'
import type { PaginationSubject } from '@/core/PaginationRangeSubject'
import type { NostrFilter } from '@/core/types'
import { Note } from '@/stores/notes/note'
import type { Repost } from '@/stores/reposts/repost'
import { EMPTY, filter, merge, mergeMap } from 'rxjs'
import type { ClientSubOptions, NostrClient } from './nostr'

export type FeedOptions = ClientSubOptions & {
  includeRoot?: boolean
  includeReplies?: boolean
  includeReposts?: boolean
  includeParents?: boolean
}

export class NostrFeeds {
  constructor(private client: NostrClient) {}

  filter(note: Note | Repost, options?: FeedOptions) {
    if (note instanceof Note) {
      if (options?.includeRoot && !note.metadata.isRoot) return false
      if (options?.includeReplies && note.metadata.isRoot) return false
      return true
    }
    return true
  }

  private subscribe(filter: NostrFilter, options?: FeedOptions) {
    switch (filter.kinds?.[0]) {
      // Assert pipeline for each kind
      case Kind.Text: {
        return merge(
          merge(
            options?.includeReposts ? this.client.reposts.subscribe(filter) : EMPTY,
            this.client.notes.subWithRelated(filter, options),
          ),
        )
      }
      // case Kind.Article TODO
      default: {
        // Unknown kind
        return this.client.notes.subWithRelated(filter, options)
      }
    }
  }

  self(filter$: PaginationSubject, options?: FeedOptions) {
    return filter$.pipe(
      mergeMap((filter) => this.subscribe(filter, options)),

      filter((note) => this.filter(note, options)),
    )
  }

  following(pagination$: PaginationSubject, options?: FeedOptions) {
    const author = pagination$.authors[0]
    return this.client.follows.subscribe(author, options).pipe(
      // Set the filter authors with the `follows` list
      mergeMap((follows) => {
        return pagination$.setFilter({
          authors: [author, ...follows.authors],
        })
      }),
      // Start notes subscription
      mergeMap((filter) => this.subscribe(filter, options)),

      filter((note) => this.filter(note, options)),
    )
  }
}
