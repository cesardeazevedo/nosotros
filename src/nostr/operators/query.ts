import type { NostrSubscription } from '@/core/NostrSubscription'
import { EMPTY, merge, tap } from 'rxjs'
import { setCache } from '../cache'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { queryDB } from './queryDB'
import { queryLocalRelay } from './queryLocalRelay'

// Query locally, IndexedDB or local relays
export function query(client: NostrClient, sub: NostrSubscription, options?: ClientSubOptions) {
  const filters = options?.cacheFilter ? [options.cacheFilter] : sub.filters
  if (filters.length > 0 && options?.queryLocal !== false) {
    const localDB$ = client.settings.localDB ? queryDB(filters) : EMPTY
    const localRelays$ = queryLocalRelay(client.pool, Array.from(client.localSets), sub, filters)
    return merge(localDB$, localRelays$).pipe(
      tap((event) => {
        sub.add(event)
        client.seen.query(event)
        setCache(event)
      }),
    )
  }
  return EMPTY
}
