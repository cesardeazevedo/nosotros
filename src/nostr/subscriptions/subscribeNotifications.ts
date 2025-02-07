import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { PaginationLimitSubject } from '@/core/PaginationLimitSubject'
import type { PaginationSubject } from '@/core/PaginationRangeSubject'
import { connect, EMPTY, from, ignoreElements, merge, mergeMap } from 'rxjs'
import { isEventTag } from '../helpers/parseTags'
import type { NostrClient } from '../nostr'
import { subscribeIdsFromQuotes } from '../operators/subscribeIdsFromQuotes'
import { type NostrEventMetadata } from '../types'
import { subscribeNotes } from './subscribeNotes'
import { subscribeReactions } from './subscribeReactions'
import { subscribeReposts } from './subscribeReposts'
import { subscribeUser } from './subscribeUser'
import { subscribeZaps } from './subscribeZaps'
import { withRelatedAuthors } from './withRelatedAuthor'

export function subscribeNotifications(client: NostrClient, pagination: PaginationLimitSubject | PaginationSubject) {
  return pagination.pipe(
    mergeMap((filter) => {
      return from(filter.kinds || []).pipe(
        mergeMap((kind) => {
          switch (kind) {
            case Kind.Text: {
              return subscribeNotes(filter, client).pipe(withRelatedAuthors(client))
            }
            case Kind.Reaction: {
              return subscribeReactions(filter, client).pipe(
                connect((shared$) => {
                  return merge(
                    shared$,
                    shared$.pipe(
                      mergeMap((event) => {
                        const ids = event.tags.filter(isEventTag).flatMap((x) => x[1])
                        return merge(
                          // get reacted note
                          from(ids).pipe(mergeMap((id) => subscribeIdsFromQuotes(id, client))),
                          // get author of reaction
                          subscribeUser(event.pubkey, client),
                        )
                      }),
                      ignoreElements(),
                    ),
                  )
                }),
              )
            }
            case Kind.Repost: {
              return subscribeReposts(filter, client)
            }
            case Kind.ZapReceipt: {
              return subscribeZaps(filter, client).pipe(
                withRelatedAuthors(client),
                ofKind<NostrEventMetadata>([Kind.ZapReceipt]), // cast
              )
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
