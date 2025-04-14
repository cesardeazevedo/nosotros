import type { Observable } from 'rxjs'
import { connect, from, ignoreElements, merge, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import type { NostrEventMetadata } from '../types'
import { metadataSymbol, WRITE } from '../types'
import { subscribeUser } from './subscribeUser'

export function withAuthorsFromNote(ctx: NostrContext) {
  return connect((shared$: Observable<NostrEventMetadata>) => {
    return merge(shared$, shared$.pipe(subscribeAuthorsFromNote(ctx), ignoreElements()))
  })
}

export function subscribeAuthorsFromNote(ctx: NostrContext) {
  return (source$: Observable<NostrEventMetadata>) => {
    return source$.pipe(
      mergeMap((event) => {
        const metadata = event[metadataSymbol]
        const authors = [event.pubkey, ...(metadata.mentionedAuthors || [])]
        const relayHints = metadata.relayHints
        return from(authors).pipe(
          mergeMap((pubkey) =>
            subscribeUser(pubkey, { ...ctx, pubkey, batcher: 'lazy', permission: WRITE, relayHints }),
          ),
        )
      }),
    )
  }
}
