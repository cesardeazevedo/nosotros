import type { RelayFilters } from 'core/NostrSubscription'
import type { NostrFilter } from 'core/types'
import type { UserRelayDB } from 'db/types'
import { filter, first, map, merge, mergeAll, mergeMap, mergeWith, takeUntil, timer } from 'rxjs'
import type { RelaySelectionConfig } from './fromUserRelays'
import { fromUserRelay } from './fromUserRelays'
import { userRelayUpdates$ } from './insertUserRelay'

export function trackUserRelays(pubkey: string, config?: RelaySelectionConfig) {
  return fromUserRelay(pubkey).pipe(
    mergeWith(
      userRelayUpdates$.pipe(
        filter((x) => x[0] === pubkey),
        map((x) => x[0]),
        // fetch the database again.
        mergeMap((pubkey) => fromUserRelay(pubkey)),
      ),
    ),
    first(),
    // Missing userRelay, kill the stream after timeout
    takeUntil(timer(config?.timeout || 4000)),
  )
}

export function trackUsersRelays(users: string[] = [], config?: RelaySelectionConfig) {
  return merge(users.map((user) => trackUserRelays(user, config))).pipe(mergeAll())
}

export function toRelayFilters(filter: NostrFilter, tag: keyof Pick<NostrFilter, 'authors' | '#p'>) {
  return mergeMap((userRelays: UserRelayDB[]) => {
    const acc = [] as RelayFilters[]
    userRelays.forEach((item) => {
      acc.push([item.relay, [{ ...filter, [tag]: [item.pubkey] }]])
    })
    return acc
  })
}
