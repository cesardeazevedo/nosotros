import { dedupe } from '@/core/helpers'
import { mapMetadata } from '@/nostr/operators/mapMetadata'
import { pruneReplaceable } from '@/nostr/prune'
import { ShareReplayCache } from '@/nostr/replay'
import type { Note } from '@/stores/models/note'
import { User } from '@/stores/models/user'
import { userStore } from '@/stores/nostr/users.store'
import { Kind } from 'constants/kinds'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import { EMPTY, from, ignoreElements, merge, mergeMap, tap } from 'rxjs'
import { parseUser } from './metadata/parseUser'

const kinds = [Kind.Metadata]

export const replay = new ShareReplayCache()

export class NIP01Users {
  constructor(private client: NostrClient) {}

  subFromNote(note: Note) {
    const authors = dedupe([note.event.pubkey], note.metadata?.mentionedAuthors)
    const relayHints = note.metadata?.relayHints
    const neededAuthors = pruneReplaceable(Kind.Metadata, authors)
    if (neededAuthors.length > 0) {
      return from(neededAuthors).pipe(mergeMap((pubkey) => this.subscribe(pubkey, { relayHints })))
    }
    return EMPTY
  }

  subscribe = replay.wrap((pubkey: string, options?: ClientSubOptions) => {
    const relayLists$ = this.client.relayList.subscribe(pubkey)

    const stream$ = this.client.subscribe({ kinds, authors: [pubkey] }, options).pipe(
      mapMetadata(parseUser),

      tap(([event, metadata]) => {
        userStore.add(new User(event, metadata))
        this.client.dns.enqueue(metadata)
      }),
    )
    return merge(stream$, relayLists$.pipe(ignoreElements()))
  })
}
