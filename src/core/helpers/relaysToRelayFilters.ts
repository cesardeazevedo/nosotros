import type { RelayFilters } from 'core/NostrSubscription'
import type { NostrFilter } from 'core/types'
import type { Observable } from 'rxjs'
import { distinct, from, map } from 'rxjs'
import { formatRelayUrl } from './formatRelayUrl'

export function relaysToRelayFilters(relays: string[], filters: NostrFilter): Observable<RelayFilters> {
  return from(relays).pipe(
    map((relay) => formatRelayUrl(relay)),
    distinct(),
    map((relay) => [relay, filters]),
  )
}
