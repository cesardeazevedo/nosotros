import { Kind } from '@/constants/kinds'
import { NostrSubscription } from '@/core/NostrSubscription'
import { start } from '@/core/operators/start'
import { addNostrEventToStore } from '@/stores/helpers/addNostrEventToStore'
import { map, of, tap, toArray } from 'rxjs'
import { parseUser } from '../helpers/parseUser'
import type { NostrClient } from '../nostr'
import { mergeMetadata } from '../operators/mapMetadata'

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

    mergeMetadata(parseUser),
    tap(addNostrEventToStore),

    toArray(),
    // TODO: filter web of trust
  )
}
