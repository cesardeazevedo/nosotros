import { Kind } from 'constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import { finalizeEvent, generateSecretKey } from 'nostr-tools'

export function fakeImageUrl(width: number, height?: number) {
  return `https://dummyimage.com/${width}x${height || width}/000/fff.jpg`
}

export function fakeNote(data?: Partial<NostrEvent>): NostrEvent {
  return {
    kind: data?.kind ?? Kind.Text,
    id: data?.id || Math.random().toString().slice(2),
    content: data?.content || 'Hello World',
    created_at: data?.created_at ?? Date.now() / 1000 - 1000,
    pubkey: data?.pubkey || '1',
    tags: data?.tags || [],
    sig: '',
  }
}

export function fakeSignature(wrappedEvent: NostrEvent) {
  return finalizeEvent(fakeNote(wrappedEvent), generateSecretKey())
}
