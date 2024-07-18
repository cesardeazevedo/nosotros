import type { UnsignedEvent } from 'nostr-tools'

export type NostrExtension = {
  getPublicKey(): Promise<string>
  signEvent(event: UnsignedEvent): Promise<NostrExtension>
}

export function getNostrExtension() {
  if ('nostr' in window) {
    return window.nostr as NostrExtension
  }
}

export async function getNostrExtensionPublicKey() {
  const nostr = getNostrExtension()
  if (nostr) {
    return await nostr.getPublicKey()
  }
}
