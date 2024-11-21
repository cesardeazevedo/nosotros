import { Kind } from '@/constants/kinds'
import type { PaginationSubject } from '@/core/PaginationSubject'
import type { NostrFilter } from '@/core/types'
import { notificationStore } from '@/stores/nostr/notifications.store'
import { connect, ignoreElements, map, merge, mergeMap } from 'rxjs'
import { isEventTag } from './helpers/parseTags'
import type { NostrClient } from './nostr'

export class Notifications {
  constructor(private client: NostrClient) {}

  subMentions(nostrFilter: NostrFilter) {
    const sub = this.client.notes.subscribe({ kinds: [Kind.Text], ...nostrFilter })
    return sub.pipe(
      map((note) => {
        return notificationStore.addMention(note)
      }),
    )
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
                this.client.notes.subIds(event.tags.filter(isEventTag).flatMap((x) => x[1])),
                // get author of reaction
                this.client.users.subscribe(event.pubkey),
              )
            }),
            ignoreElements(),
          ),
        )
      }),
      map((event) => notificationStore.addReactions(event)),
    )
  }

  subZaps(filter: NostrFilter) {
    return this.client.zaps.subscribe(filter).pipe(
      connect((shared$) => {
        return merge(
          shared$,
          shared$.pipe(
            // move this to the zap subscriber directly
            mergeMap(([event]) => this.client.users.subscribe(event.pubkey)),
            ignoreElements(),
          ),
        )
      }),
      map(([event]) => notificationStore.addZap(event)),
    )
  }

  subReposts(filter: NostrFilter) {
    return this.client.reposts.subscribe(filter).pipe(map((note) => notificationStore.addRepost(note)))
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
