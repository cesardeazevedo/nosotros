import type { RelayFilters } from 'core/NostrSubscription'
import type { NostrFilter } from 'core/types'
import type { Observable } from 'rxjs'
import { identity, map, mergeMap } from 'rxjs'
import { formatRelayUrl } from './formatRelayUrl'

export function relaysToRelayFilters(relays: Observable<string[]>, filters: NostrFilter[]): Observable<RelayFilters> {
  return relays.pipe(
    mergeMap(identity),
    map((relay) => formatRelayUrl(relay)),
    map((relay) => [relay, filters]),
  )
}
