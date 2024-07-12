import type { NostrFilter } from "core/types"
import type { Observable } from "rxjs"
import { map } from "rxjs"
import { formatRelayUrl } from "./formatRelayUrl"

export function relaysToRelayFilters(relays: Observable<string[]>, filters: NostrFilter[]) {
  return relays.pipe(
    map((relay) => relay.map((url) => ({ [formatRelayUrl(url)]: filters }))),
  )
}
