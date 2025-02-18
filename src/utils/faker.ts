import { parseComment } from '@/nostr/helpers/parseComment'
import { parseNote } from '@/nostr/helpers/parseNote'
import type { NostrEventComment, NostrEventNote } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { Kind } from 'constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import { finalizeEvent, generateSecretKey } from 'nostr-tools'

export function fakeEvent(data?: Partial<NostrEvent>): NostrEvent {
  return {
    kind: data?.kind ?? Kind.Text,
    id: data?.id || Math.random().toString().slice(2),
    content: data?.content || 'Hello World',
    created_at: data?.created_at ?? Math.floor(Date.now() / 1000 - 1000),
    pubkey: data?.pubkey || '1',
    tags: data?.tags || [],
    sig: '',
  }
}

export function fakeNote(data?: Partial<NostrEvent>): NostrEventNote {
  const event = fakeEvent(data)
  return {
    ...event,
    [metadataSymbol]: parseNote(event),
  }
}

export function fakeComment(data?: Partial<NostrEvent>): NostrEventComment {
  const event = fakeEvent(data)
  return {
    ...event,
    [metadataSymbol]: parseComment(event),
  }
}

export function fakeSignature(wrappedEvent: NostrEvent) {
  return finalizeEvent(fakeEvent(wrappedEvent), generateSecretKey())
}
