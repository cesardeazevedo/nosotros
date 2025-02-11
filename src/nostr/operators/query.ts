import type { NostrSubscription } from '@/core/NostrSubscription'
import { EMPTY, merge, tap } from 'rxjs'
import { setCache } from '../cache'
import type { NostrContext } from '../context'
import { seen } from '../seen'
import { queryDB } from './queryDB'
import { queryLocalRelay } from './queryLocalRelay'

// Query locally, IndexedDB or local relays
export function query(sub: NostrSubscription, ctx: NostrContext) {
  const { subOptions } = ctx
  const filters = subOptions?.cacheFilter ? [subOptions.cacheFilter] : sub.filters
  if (filters.length > 0 && subOptions?.queryLocal !== false) {
    const localDB$ = ctx.settings.localDB ? queryDB(filters) : EMPTY
    const localRelays$ = queryLocalRelay(Array.from(ctx.localSets), sub, filters)
    return merge(localDB$, localRelays$).pipe(
      tap((event) => {
        sub.add(event)
        seen.query(event)
        setCache(event)
      }),
    )
  }
  return EMPTY
}
