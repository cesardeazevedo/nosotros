import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { PaginationLimitSubject } from '@/core/PaginationLimitSubject'
import type { PaginationSubject } from '@/core/PaginationRangeSubject'
import { connect, EMPTY, from, ignoreElements, merge, mergeMap } from 'rxjs'
import { isEventTag } from '../helpers/parseTags'
import type { NostrContext } from '../context'
import { type NostrEventMetadata } from '../types'
import { subscribeIdsFromQuotes } from './subscribeIdsFromQuotes'
import { subscribeNotes } from './subscribeNotes'
import { subscribeReactions } from './subscribeReactions'
import { subscribeReposts } from './subscribeReposts'
import { subscribeUser } from './subscribeUser'
import { subscribeZaps } from './subscribeZaps'
import { withRelatedAuthors } from './withRelatedAuthor'

export function subscribeNotifications(pagination: PaginationLimitSubject | PaginationSubject, ctx: NostrContext) {
  return pagination.pipe(
    mergeMap((filter) => {
      return from(filter.kinds || []).pipe(
        mergeMap((kind) => {
          switch (kind) {
            case Kind.Text: {
              return subscribeNotes(filter, ctx).pipe(withRelatedAuthors(ctx))
            }
            case Kind.Reaction: {
              return subscribeReactions(filter, ctx).pipe(
                connect((shared$) => {
                  return merge(
                    shared$,
                    shared$.pipe(
                      mergeMap((event) => {
                        const ids = event.tags.filter(isEventTag).flatMap((x) => x[1])
                        return merge(
                          // get reacted note
                          from(ids).pipe(mergeMap((id) => subscribeIdsFromQuotes(id, ctx))),
                          // get author of reaction
                          subscribeUser(event.pubkey, ctx),
                        )
                      }),
                      ignoreElements(),
                    ),
                  )
                }),
              )
            }
            case Kind.Repost: {
              return subscribeReposts(filter, ctx)
            }
            case Kind.ZapReceipt: {
              return subscribeZaps(filter, ctx).pipe(
                withRelatedAuthors(ctx),
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
