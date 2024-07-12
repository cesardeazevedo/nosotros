import { Kind } from "constants/kinds"
import { bufferTime } from "core/operators/bufferTime"
import type { SeenDB } from "db/types"
import { storage } from "nostr/storage"
import { Subject, filter } from "rxjs"

const buffer = new Subject<SeenDB>()

buffer.pipe(
  // We only keep track of notes (at least for now)
  filter((seen) => [Kind.Text, Kind.Article].includes(seen.kind)),
  bufferTime(5000),
).subscribe((data) => {
  storage.insertSeenBulk(data)
})

export function insertSeen(value: SeenDB) {
  buffer.next(value)
}
