import { Kind } from '@/constants/kinds'
import { NostrSubscription } from '@/core/NostrSubscription'
import { start } from '@/core/operators/start'
import { addNostrEventToStore } from '@/stores/helpers/addNostrEventToStore'
import { map, of, tap, toArray } from 'rxjs'
import { parseUser } from '../helpers/parseUser'
import { parseMetadata } from '../operators/parseMetadata'
import { pool } from '../pool'

export function subscribeSearch(query: string, limit = 10) {
  const filter = {
    kinds: [Kind.Metadata],
    search: query,
    limit,
  }

  const sub = new NostrSubscription(filter, { relays: of(['wss://relay.nostr.band']) })

  return of(sub).pipe(
    start(pool),
    map(([, event]) => event),

    parseMetadata(parseUser),
    tap(addNostrEventToStore),

    toArray(),
    // TODO: filter web of trust
  )
}
