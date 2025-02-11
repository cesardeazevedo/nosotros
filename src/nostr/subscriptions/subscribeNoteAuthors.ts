import { connect, from, ignoreElements, merge, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import { metadataSymbol } from '../types'
import type { Note$ } from './subscribeThreads'
import { subscribeUser } from './subscribeUser'

export function withAuthorsFromNote(ctx: NostrContext) {
  return connect((shared$: Note$) => {
    return merge(shared$, shared$.pipe(subscribeAuthorsFromNote(ctx), ignoreElements()))
  })
}

export function subscribeAuthorsFromNote(ctx: NostrContext) {
  return (source$: Note$) => {
    return source$.pipe(
      mergeMap((event) => {
        const metadata = event[metadataSymbol]
        const authors = [event.pubkey, ...(metadata.mentionedAuthors || [])]
        const relayHints = metadata.relayHints
        return from(authors).pipe(mergeMap((pubkey) => subscribeUser(pubkey, { ...ctx, subOptions: { relayHints } })))
      }),
    )
  }
}
