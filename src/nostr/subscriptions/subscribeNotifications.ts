import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { connect, EMPTY, from, ignoreElements, merge, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import { isEventTag } from '../helpers/parseTags'
import { subscribeComments } from './subscribeComments'
import { subscribeIdsFromQuotes } from './subscribeIdsFromQuotes'
import { subscribeNotes } from './subscribeNotes'
import { subscribeReactions } from './subscribeReactions'
import { subscribeReposts } from './subscribeReposts'
import { subscribeUser } from './subscribeUser'
import { subscribeZaps } from './subscribeZaps'
import { withRelatedAuthors } from './withRelatedAuthor'

export function subscribeNotifications(filter: NostrFilter, baseCtx: NostrContext) {
  const ctx = { ...baseCtx, queryDB: false } as NostrContext

  return from(filter.kinds || []).pipe(
    mergeMap((kind) => {
      switch (kind) {
        case Kind.Text: {
          return subscribeNotes(filter, ctx).pipe(withRelatedAuthors(ctx))
        }
        case Kind.Comment: {
          return subscribeComments(filter, ctx).pipe(withRelatedAuthors(ctx))
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
          return subscribeZaps(filter, ctx).pipe(withRelatedAuthors(ctx))
        }
        default: {
          return EMPTY
        }
      }
    }),
  )
}
