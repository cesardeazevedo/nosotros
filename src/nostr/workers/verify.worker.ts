import type { NostrEvent } from 'nostr-tools'
import { verifyEvent } from 'nostr-tools'

self.onmessage = function onMessageVerifyEvent(event: MessageEvent<NostrEvent>) {
  self.postMessage(verifyEvent(event.data))
}
