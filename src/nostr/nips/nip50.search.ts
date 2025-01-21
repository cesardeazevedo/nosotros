import { Kind } from '@/constants/kinds'
import { NostrSubscription } from '@/core/NostrSubscription'
import { start } from '@/core/operators/start'
import { map, of, tap, toArray } from 'rxjs'
import type { NostrClient } from '../nostr'
import { parseUser } from '../helpers/parseUser'
import { mergeMetadata } from '../operators/mapMetadata'
import { addNostrEventToStore } from '@/stores/helpers/addNostrEventToStore'

export class NIP50Search {
  constructor(private client: NostrClient) {}

  subscribe(query: string, limit = 10) {
    const filter = {
      kinds: [Kind.Metadata],
      search: query,
      limit,
    }

    const sub = new NostrSubscription(filter, { relays: of(['wss://relay.nostr.band']) })

    return of(sub).pipe(
      start(this.client.pool),
      map(([, event]) => event),

      mergeMetadata(parseUser),
      tap(addNostrEventToStore),

      toArray(),
      // TODO: filter web of trust
    )
  }
}
