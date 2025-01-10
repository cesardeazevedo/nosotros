import { Kind } from '@/constants/kinds'
import type { PaginationSubject } from '@/core/PaginationRangeSubject'
import type { NostrFilter } from '@/core/types'
import { connect, ignoreElements, merge, mergeMap } from 'rxjs'
import { isEventTag } from './helpers/parseTags'
import type { NostrClient } from './nostr'

export class Notifications {
  constructor(private client: NostrClient) {}

  subMentions(nostrFilter: NostrFilter) {
    return this.client.notes.subscribe({ kinds: [Kind.Text], ...nostrFilter })
  }

  subReactions(filter: NostrFilter) {
    return this.client.reactions.subscribe(filter).pipe(
      connect((shared$) => {
        return merge(
          shared$,
          shared$.pipe(
            mergeMap((event) => {
              return merge(
                // get reacted note
                this.client.notes.subNotesWithRelated({ ids: event.tags.filter(isEventTag).flatMap((x) => x[1]) }),
                // get author of reaction
                this.client.users.subscribe(event.pubkey),
              )
            }),
            ignoreElements(),
          ),
        )
      }),
    )
  }

  subZaps(filter: NostrFilter) {
    return this.client.zaps.subscribe(filter).pipe(
      connect((shared$) => {
        return merge(
          shared$,
          shared$.pipe(
            // move this to the zap subscriber directly
            mergeMap((event) => this.client.users.subscribe(event.pubkey)),
            ignoreElements(),
          ),
        )
      }),
    )
  }

  subReposts(filter: NostrFilter) {
    return this.client.reposts.subscribeWithRepostedEvent(filter)
  }

  subscribe(filter: NostrFilter) {
    return merge(
      //
      this.subMentions(filter),
      this.subReposts(filter),
      this.subZaps(filter),
      this.subReactions(filter),
    )
  }

  subscribePagination(pagination: PaginationSubject) {
    return pagination.pipe(mergeMap((pagination) => this.subscribe(pagination)))
  }
}
