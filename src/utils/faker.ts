import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { Metadata } from '@/nostr/types'
import { Kind } from 'constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import { finalizeEvent, generateSecretKey } from 'nostr-tools'

export function fakeEvent(data?: Partial<NostrEvent>): NostrEvent {
  const kind = data?.kind ?? Kind.Text
  return {
    kind,
    id: data?.id || Math.random().toString().slice(2),
    content: data?.content ?? 'Hello World',
    created_at: data?.created_at ?? Math.floor(Date.now() / 1000 - 1000),
    pubkey: data?.pubkey || '1',
    tags: data?.tags || [],
    sig: '',
  }
}

export function fakeEventMeta(
  data: Partial<NostrEvent>,
  metadata: (event: NostrEvent) => Metadata = () => ({}),
): NostrEventDB {
  const event = fakeEvent(data)
  return {
    ...event,
    metadata: metadata(event),
  }
}

export function fakeSignature(wrappedEvent: NostrEvent) {
  return finalizeEvent(fakeEvent(wrappedEvent), generateSecretKey())
}
