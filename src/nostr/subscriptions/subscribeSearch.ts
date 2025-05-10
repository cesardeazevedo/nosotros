import { Kind } from '@/constants/kinds'
import { SEARCH_RELAYS } from '@/constants/relays'
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

  const sub = new NostrSubscription(filter, { relays: of(SEARCH_RELAYS) })

  return of(sub).pipe(
    start(pool),
    map(([, event]) => event),

    parseMetadata(parseUser),
    tap(addNostrEventToStore),

    toArray(),
  )
}
