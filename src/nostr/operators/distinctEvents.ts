import type { NostrEvent } from 'nostr-tools'
import { distinct, map, pipe } from 'rxjs'

export function distinctEvent() {
  return pipe(
    distinct(([, event]: [string, NostrEvent]) => event.id),
    map((data) => data[1]),
  )
}
