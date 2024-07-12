import type { NostrEvent } from "core/types"
import { verifyEvent } from "nostr-tools"
import { filter } from "rxjs"

/**
 * Filter out invalid events and invalid signatures
 */
export function validateNostrEvent() {
  return filter((event: NostrEvent) => verifyEvent(event))
}
