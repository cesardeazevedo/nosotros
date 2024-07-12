import { filter, first, map, mergeWith } from "rxjs"
import { fromUserRelay } from "./fromUserRelays"
import { userRelayUpdates$ } from "./insertUserRelay"


export function trackUserRelays(pubkey: string) {
  return fromUserRelay(pubkey).pipe(
    mergeWith(
      userRelayUpdates$.pipe(
        filter((x) => x[0] === pubkey),
        map((x) => x[1]),
      ),
    ),
    first(),
    //map((x) => x.map((x) => x.relay)),
    map((x) => ({ [pubkey]: x }))
  )
}
