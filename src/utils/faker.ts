import { Kind } from 'constants/kinds'
import type { UserDB } from 'nostr/types'
import { getEventHash, getPublicKey, getSignature, type Event } from 'nostr-tools'
import type { UserMetaData } from 'nostr/nips/nip01/metadata/parseUser'

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

// To help some tests that need signatures
const privateKeys = {
  '1': 'dc75513e6a77f59c06af06fc5cbc6e56e01aad1b53289ae04b73ffcaa479a629',
  '2': '3f2ae5a00851c710a878fe71fdf3aabfde510e426f6f8b03f53fde213209579e',
  '3': '9a36a7d13128752a183b4153bc5242605c44eabb6e7e72e6f4fdc83c51aaa786',
  '4': 'cea609544ceca847d5b0053be42d236772c5041c4c651d2bc91c74149e8fc7f7',
  '5': 'dd6b130dbbb576c0fc71b166522dcad04e003b74d88690898ce5c2b630ead6d8',
} as Record<string, string>

export function fakeSignature(wrappedEvent: Event) {
  // eslint-disable-next-line
  const { id, sig, ...rest } = wrappedEvent
  const privateKey = privateKeys[rest.pubkey || '1'] || privateKeys['1']
  const event = {
    ...rest,
    pubkey: getPublicKey(privateKey),
  }
  return {
    ...event,
    id: getEventHash(event),
    sig: getSignature(event, privateKey),
  }
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
