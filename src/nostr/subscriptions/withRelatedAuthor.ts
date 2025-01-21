import type { Observable } from 'rxjs'
import { connect, from, ignoreElements, merge, mergeMap } from 'rxjs'
import { isAuthorTag } from '../helpers/parseTags'
import type { NostrClient } from '../nostr'
import type { NostrEventMetadata } from '../types'

// Generic authors for any event
export function withRelatedAuthors(client: NostrClient) {
  return connect((shared$: Observable<NostrEventMetadata>) => {
    return merge(
      shared$,
      shared$.pipe(
        mergeMap((event) => {
          const authors = [event.pubkey, ...event.tags.filter(isAuthorTag).map((x) => x[1])]
          return from(authors).pipe(mergeMap((pubkey) => client.users.subscribe(pubkey)))
        }),
        ignoreElements(),
      ),
    )
  })
}
