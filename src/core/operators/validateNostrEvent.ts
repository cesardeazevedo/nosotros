import type { NostrEvent } from "core/types"
import { validateEvent, verifySignature } from "nostr-tools"
import { filter } from "rxjs"

/**
 * Filter out invalid events and invalid signatures
 */
export function validateNostrEvent() {
  return filter(
    (event: NostrEvent) => {
      return validateEvent(event) && verifySignature(event)
    },
  )
}
