import { Kind } from '@/constants/kinds'
import { NostrSubscription } from '@/core/NostrSubscription'
import { start } from '@/core/operators/start'
import { addNostrEventToStore } from '@/stores/helpers/addNostrEventToStore'
import { map, of, tap, toArray } from 'rxjs'
import { parseUser } from '../helpers/parseUser'
import type { NostrClient } from '../nostr'
import { parseMetadata } from '../operators/parseMetadata'

export function subscribeSearch(query: string, limit = 10, client: NostrClient) {
  const filter = {
    kinds: [Kind.Metadata],
    search: query,
    limit,
  }

  const sub = new NostrSubscription(filter, { relays: of(['wss://relay.nostr.band']) })

  return of(sub).pipe(
    start(client.pool),
    map(([, event]) => event),

    parseMetadata(parseUser),
    tap(addNostrEventToStore),

    toArray(),
    // TODO: filter web of trust
  )
}
