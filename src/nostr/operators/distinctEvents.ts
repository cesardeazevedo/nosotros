import type { NostrEvent } from "core/types"
import type { SeenDB } from "db/types"
import { filter, map, pipe } from "rxjs"
import { seenStore } from "stores/nostr/seen.store"
import { insertSeen } from "./insertSeen"

export function distinctEvent() {
  return pipe(
    filter(([relay, event]: [string, NostrEvent]) => {
      const hasSeen = seenStore.seen.has(event.id)
      const data = { relay, kind: event.kind, eventId: event.id } as SeenDB
      seenStore.add(data)
      insertSeen(data)
      return !hasSeen
    }),
    map((data) => data[1]),
  )
}
