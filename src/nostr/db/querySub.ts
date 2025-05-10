import type { NostrSubscription } from '@/core/NostrSubscription'
import { EMPTY, merge, tap } from 'rxjs'
import { setCache } from '../cache'
import type { NostrContext } from '../context'
import { seen } from '../seen'
import { queryDB } from './queryDB'
import { queryLocalRelay } from './queryLocalRelay'

// Query locally, IndexedDB or local relays
export function querySub(sub: NostrSubscription, ctx: NostrContext) {
  if (sub.filters.length > 0 && ctx?.queryDB !== false) {
    const localDB$ = queryDB(sub.filters)
    const localRelays$ = queryLocalRelay(ctx.relaysLocal || [], sub)
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
