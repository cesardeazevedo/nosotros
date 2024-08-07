import { Kind } from 'constants/kinds'
import { finalizeEvent, generateSecretKey, type Event } from 'nostr-tools'
import type { UserMetaData } from 'nostr/nips/nip01/metadata/parseUser'
import type { UserDB } from 'nostr/types'

export function fakeImageUrl(width: number, height?: number) {
  return `https://dummyimage.com/${width}x${height || width}/000/fff.jpg`
}

export function fakeUserData(data?: Partial<UserDB['metadata']>): Partial<UserMetaData> {
  return {
    ...data,
    name: data?.name || 'name',
    about: data?.about || 'user description',
    picture: data?.picture ?? 'https://dummyimage.com/120x120/000/fff',
    followersCount: 5,
    followingCount: 10,
    nip05valid: false,
    website: 'https://nostr.com',
  }
}

export function fakeUser(pubkey?: string, data?: Partial<UserMetaData>): Event {
  return {
    kind: Kind.Metadata,
    id: '1',
    content: JSON.stringify(fakeUserData(data)),
    created_at: Date.now(),
    pubkey: pubkey || '1',
    sig: '',
    tags: [],
  }
}

export function fakeNote(data?: Partial<Event>): Event {
  return {
    kind: data?.kind ?? Kind.Text,
    id: data?.id || Math.random().toString().slice(2),
    content: data?.content || 'Hello World',
    created_at: data?.created_at || Date.now() / 1000 - 1000,
    pubkey: data?.pubkey || '1',
    tags: data?.tags || [],
    sig: '',
  }
}

export function fakeSignature(wrappedEvent: Event) {
  return finalizeEvent(fakeNote(wrappedEvent), generateSecretKey())
}

export function fakeReaction(data?: Partial<Event>): Event {
  return {
    kind: Kind.Reaction,
    id: Math.random().toString().slice(2),
    content: data?.content || '🤙',
    created_at: data?.created_at || Date.now() / 1000 - 1000,
    pubkey: data?.pubkey || '1',
    tags: data?.tags || [[]],
    sig: '',
  }
}
