import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import { connect, from, ignoreElements, merge, mergeMap, of } from 'rxjs'
import type { NostrContext } from '../context'
import { isEventTag } from '../helpers/parseTags'
import { subscribe } from './subscribe'
import { subscribeIdsFromQuotes } from './subscribeIdsFromQuotes'
import { subscribeUser } from './subscribeUser'
import { withRelatedAuthors } from './withRelatedAuthor'

export function subscribeNotifications(filter: NostrFilter, baseCtx: NostrContext) {
  const ctx = { ...baseCtx, queryDB: false } as NostrContext

  return subscribe(filter, ctx).pipe(
    mergeMap((event) => {
      switch (event.kind) {
        case Kind.Reaction: {
          // get the reacted note
          return of(event).pipe(
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
        default: {
          return of(event).pipe(withRelatedAuthors(ctx))
        }
      }
    }),
  )
}
