import { connect, from, ignoreElements, merge, mergeMap } from 'rxjs'
import type { NostrClient } from '../nostr'
import { metadataSymbol } from '../types'
import type { Note$ } from './subscribeThreads'
import { subscribeUser } from './subscribeUser'

export function withAuthorsFromNote(client: NostrClient) {
  return connect((shared$: Note$) => {
    return merge(shared$, shared$.pipe(subscribeAuthorsFromNote(client), ignoreElements()))
  })
}

export function subscribeAuthorsFromNote(client: NostrClient) {
  return (source$: Note$) => {
    return source$.pipe(
      mergeMap((event) => {
        const metadata = event[metadataSymbol]
        const authors = [event.pubkey, ...(metadata.mentionedAuthors || [])]
        const relayHints = metadata.relayHints
        return from(authors).pipe(mergeMap((pubkey) => subscribeUser(pubkey, client, { relayHints })))
      }),
    )
  }
}
