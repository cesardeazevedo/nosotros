import type { NostrFilter } from '@/core/types'
import { reactionStore } from '@/stores/reactions/reactions.store'
import { Kind } from 'constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import { from, ignoreElements, mergeMap, mergeWith, tap } from 'rxjs'
import { db } from '../db'

const kinds = [Kind.Reaction]

export class NIP25Reactions {
  constructor(private client: NostrClient) {}

  publish(event: NostrEvent, reaction: string) {
    return this.client.publish(
      {
        kind: Kind.Reaction,
        content: reaction,
        tags: [
          ['p', event.pubkey],
          ['e', event.id],
        ],
      },
      {
        include: [event],
      },
    )
  }

  subscribe(filter: NostrFilter, options?: ClientSubOptions) {
    return this.client.subscribe({ kinds, ...filter }, { ...options }).pipe(
      mergeWith(
        from(filter['#e'] || []).pipe(
          mergeMap((id) => {
            return from(db.event.countTags(Kind.Reaction, 'e', id)).pipe(
              tap((count) => reactionStore.addCount(id, count)),
            )
          }),
          ignoreElements(),
        ),
      ),
    )
  }
}
