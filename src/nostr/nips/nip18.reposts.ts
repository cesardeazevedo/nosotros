import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'
import { EMPTY, filter, ignoreElements, map, merge, mergeMap } from 'rxjs'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { metadataSymbol, type NostrEventRepost } from '../types'

const kinds = [Kind.Repost]

export class NIP18Reposts {
  constructor(private client: NostrClient) {}

  publish(event: NostrEvent) {
    return this.client.publish({
      kind: Kind.Repost,
      content: JSON.stringify(event),
      tags: [
        ['e', event.id],
        ['p', event.pubkey],
      ],
    })
  }

  withRelatedEvent() {
    return mergeMap((event: NostrEventRepost) => {
      const metadata = event[metadataSymbol]
      const relayHints = metadata.relayHints
      const id = metadata.mentionedNotes[0]
      if (id) {
        return merge(
          // get repost author
          this.client.users.subscribe(event.pubkey).pipe(ignoreElements()),
          // get inner note
          this.client.notes.subNotesWithRelated({ ids: [id] }, { relayHints }).pipe(
            filter((event) => event.id === id),
            map(() => event),
          ),
        )
      }
      return EMPTY
    })
  }

  subscribe(filter: NostrFilter, options?: ClientSubOptions) {
    return this.client
      .subscribe({ ...filter, kinds }, { ...options, cacheFilter: { kinds, ...options?.cacheFilter } })
      .pipe(ofKind<NostrEventRepost>([Kind.Repost]))
  }

  subscribeWithRepostedEvent(filter: NostrFilter, options?: ClientSubOptions) {
    return this.subscribe(filter, options).pipe(this.withRelatedEvent())
  }
}
