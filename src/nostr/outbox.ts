import type { NostrFilter } from 'core/types'
import type { Observable } from 'rxjs'
import { combineLatestWith, EMPTY, filter, from, map, merge, mergeMap, takeUntil, timer } from 'rxjs'
import type { RelaySelectionConfig } from './operators/fromUserRelays'
import { toRelayFilters, trackUsersRelays } from './operators/trackUserRelays'

interface OutboxConfig extends RelaySelectionConfig {
  enabled?: boolean
  ignoreRelays: Observable<string[]>
}

const defaultConfig = {
  enabled: true,
  maxRelaysPerUser: 10,
} as OutboxConfig

export function outbox(config: OutboxConfig = defaultConfig) {
  const options = Object.assign({}, defaultConfig, config)
  if (!options.enabled) {
    return () => EMPTY
  }

  return (filters: NostrFilter[]) => {
    return from(filters).pipe(
      combineLatestWith(config.ignoreRelays.pipe(map((x) => new Set(x)))),

      mergeMap(([filter, ignoreRelays]) => {
        const relaySelection: RelaySelectionConfig = {
          ignore: ignoreRelays,
          maxRelaysPerUser: options.maxRelaysPerUser,
        }
        // Track pubkeys from authors property
        const authors$ = trackUsersRelays(filter.authors, relaySelection).pipe(toRelayFilters(filter, 'authors'))

        // Track pubkeys from #p property
        const p$ = trackUsersRelays(filter['#p'], relaySelection).pipe(toRelayFilters(filter, '#p'))

        return merge(authors$, p$)
      }),

      filter((x) => x.length > 0),

      takeUntil(timer(4000)),
    )
  }
}
