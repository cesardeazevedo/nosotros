import type { Kind } from "constants/kinds"
import type { NostrEvent } from "core/types"
import type { OperatorFunction } from "rxjs"
import { filter } from "rxjs"

/**
 * filter by kind
 */
export function ofKind(kinds: Kind[]): OperatorFunction<NostrEvent, NostrEvent> {
  return filter((event) => {
    for (let i = 0; i < kinds.length; i++) {
      if (event.kind === kinds[i]) {
        return true
      }
    }
    return false
  })
}
