import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import { EMPTY, filter, ignoreElements, map, merge, mergeMap } from 'rxjs'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { metadataSymbol, type NostrEventRepost } from '../types'
import { subscribe } from './subscribe'
import { subscribeNotesWithRelated } from './subscribeNotes'
import { subscribeUser } from './subscribeUser'

const kinds = [Kind.Repost]

export function withRepostedEvent(client: NostrClient) {
  return mergeMap((event: NostrEventRepost) => {
    const metadata = event[metadataSymbol]
    const relayHints = metadata.relayHints
    const id = metadata.mentionedNotes[0]
    if (id) {
      return merge(
        // get repost author
        subscribeUser(event.pubkey, client).pipe(ignoreElements()),
        // get inner note
        subscribeNotesWithRelated({ ids: [id] }, client, { relayHints }).pipe(
          filter((event) => event.id === id),
          map(() => event),
        ),
      )
    }
    return EMPTY
  })
}

export function subscribeReposts(filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) {
  return subscribe({ ...filter, kinds }, client, options).pipe(
    ofKind<NostrEventRepost>([Kind.Repost]),
    // Only return reposts after getting the actual reposted event
    withRepostedEvent(client),
  )
}
