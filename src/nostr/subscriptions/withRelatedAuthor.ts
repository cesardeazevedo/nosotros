import type { Observable } from 'rxjs'
import { connect, from, ignoreElements, merge, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import { isAuthorTag } from '../helpers/parseTags'
import type { NostrEventMetadata } from '../types'
import { subscribeUser } from './subscribeUser'

// Generic authors for any event
export function withRelatedAuthors(ctx: NostrContext) {
  return connect((shared$: Observable<NostrEventMetadata>) => {
    return merge(
      shared$,
      shared$.pipe(
        mergeMap((event) => {
          const authors = [event.pubkey, ...event.tags.filter(isAuthorTag).map((x) => x[1])]
          return from(authors).pipe(mergeMap((pubkey) => subscribeUser(pubkey, ctx)))
        }),
        ignoreElements(),
      ),
    )
  })
}
