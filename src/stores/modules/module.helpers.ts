import { Kind } from '@/constants/kinds'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { READ, WRITE } from '@/nostr/types'
import { Duration } from 'luxon'
import type { AddressPointer, EventPointer } from 'nostr-tools/nip19'
import type { FeedModuleSnapshotIn } from './feed.module'
import { FeedModuleModel } from './feed.module'
import { HomeModuleModel } from './home.module'
import { MediaModuleModel } from './media.module'
import type { NostrModuleSnapshotIn } from './nostr.module'
import { NostrModuleModule } from './nostr.module'
import { NProfileModuleModel } from './nprofile.module'
import { RelayDiscoveryModuleModel } from './relay.discovery.module'

export function createFeedModule(snapshot: FeedModuleSnapshotIn) {
  return FeedModuleModel.create(snapshot)
}

export function createHomeModule(pubkey: string | undefined) {
  return HomeModuleModel.create({
    id: pubkey ? 'home' : 'home_guest',
    pubkey,
  })
}

export function createNotificationModule(pubkey: string) {
  return createFeedModule({
    id: pubkey,
    type: 'notifications',
    feed: {
      scope: 'inbox',
      context: { pubkey, permission: READ },
      filter: {
        kinds: [Kind.Text, Kind.Comment, Kind.Repost, Kind.Reaction, Kind.ZapReceipt],
        '#p': [pubkey],
        limit: 20,
      },
      // range: Duration.fromObject({ days: 7 }).as('minutes'),
      options: {
        includeRoot: true,
        includeMentions: true,
        includeReplies: true,
        includeMuted: false,
      },
    },
  })
}

export function createMediaModule(pubkey: string | undefined) {
  return MediaModuleModel.create({
    type: 'media',
    layout: 'row',
    pubkey,
  })
}

export function createArticleModule(pubkey: string | undefined) {
  return createFeedModule({
    type: 'articles',
    feed: {
      scope: pubkey ? 'following' : 'self',
      context: {},
      filter: {
        kinds: [Kind.Article],
        authors: pubkey ? [pubkey] : RECOMMENDED_PUBKEYS,
      },
      range: Duration.fromObject({ days: 10 }).as('minutes'),
    },
  })
}

export function createRelayFeedModule(relays: string[]) {
  return createFeedModule({
    type: 'relayfeed',
    feed: {
      scope: 'self',
      context: { relays, batcher: 'raw', outbox: false, queryDB: false, insertDB: false },
      filter: {
        kinds: [Kind.Text, Kind.Repost],
        limit: 50,
      },
    },
  })
}

export function createNProfileModule(pubkey: string, relays?: string[]) {
  return NProfileModuleModel.create({ pubkey, relays })
}

export function createNostrModule(snapshot: NostrModuleSnapshotIn) {
  return NostrModuleModule.create(snapshot)
}

export function createNEventModule(nevent: EventPointer) {
  return createNostrModule({
    type: 'event',
    filter: { ids: [nevent.id] },
    context: {
      pubkey: nevent.author,
      relays: nevent.relays || [],
      permission: WRITE,
    },
  })
}

export function createNoteModule(id: string) {
  return createNostrModule({
    type: 'event',
    filter: { ids: [id] },
    context: {
      relays: ['wss://relay.nostr.band'],
    },
  })
}

export function createNAddressModule(naddress: AddressPointer) {
  return NostrModuleModule.create({
    type: 'event',
    filter: {
      kinds: [naddress.kind],
      authors: [naddress.pubkey],
      '#d': [naddress.identifier],
    },
    context: {
      permission: WRITE,
      pubkey: naddress.pubkey,
      relays: [...(naddress.relays || []), 'wss://relay.nostr.band'],
    },
  })
}

export function createTagModule(tag: string) {
  return createFeedModule({
    type: 'tags',
    feed: {
      scope: 'self',
      context: {
        relays: ['wss://relay.nostr.band'],
      },
      filter: {
        kinds: [Kind.Text],
        '#t': [tag],
        limit: 50,
      },
    },
  })
}

export function createSearchModule(query: string) {
  return FeedModuleModel.create({
    type: 'search',
    feed: {
      scope: 'self',
      context: { relays: ['wss://relay.nostr.band'] },
      filter: {
        kinds: [Kind.Text],
        search: query,
        limit: 50,
      },
      blured: true,
      options: {
        includeRoot: true,
        includeParents: false,
        includeReplies: true,
      },
    },
  })
}

export function createRelayDiscoveryModule() {
  return RelayDiscoveryModuleModel.create({
    feed: {
      filter: { kinds: [Kind.RelayDiscovery], limit: 500 },
      scope: 'self',
      context: {
        relays: ['wss://monitorlizard.nostr1.com'],
        queryDB: false,
      },
    },
  })
}
