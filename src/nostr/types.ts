import type { Kind } from '@/constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import type { FollowsMetadata } from './helpers/parseFollowList'
import type { NoteMetadata } from './helpers/parseNote'
import type { UserRelayListMetadata } from './helpers/parseRelayList'
import type { RepostMetadata } from './helpers/parseRepost'
import type { UserMetadata } from './helpers/parseUser'
import type { ZapReceiptMetadata } from './helpers/parseZap'
import type { RelayDiscoveryMetadata } from './helpers/parseRelayDiscovery'
import type { CommentMetadata } from './helpers/parseComment'

export type * from './helpers/parseFollowList'
export type * from './helpers/parseNote'
export * from './helpers/parseRelayList'
export type * from './helpers/parseRepost'
export type * from './helpers/parseUser'

export const metadataSymbol = Symbol('metadata')

export type MetadataSymbol<T> = { [metadataSymbol]: T }

type Metadata =
  | UserMetadata
  | NoteMetadata
  | FollowsMetadata
  | RepostMetadata
  | UserRelayListMetadata
  | ZapReceiptMetadata
  | RelayDiscoveryMetadata
  | CommentMetadata

export type NostrEventUserMetadata = NostrEvent & MetadataSymbol<UserMetadata>
export type NostrEventNote = NostrEvent & MetadataSymbol<NoteMetadata>
export type NostrEventFollow = NostrEvent & MetadataSymbol<FollowsMetadata>
export type NostrEventRepost = NostrEvent & MetadataSymbol<RepostMetadata>
export type NostrEventRelayList = NostrEvent & MetadataSymbol<UserRelayListMetadata>
export type NostrEventZapReceipt = NostrEvent & MetadataSymbol<ZapReceiptMetadata>
export type NostrEventRelayDiscovery = NostrEvent & MetadataSymbol<RelayDiscoveryMetadata>
export type NostrEventComment = NostrEvent & MetadataSymbol<CommentMetadata>
export type NostrEventGeneric = NostrEvent & MetadataSymbol<{ kind: Exclude<Kind, Pick<Metadata, 'kind'>['kind']> }> // generic event

export type NostrEventMetadata =
  | NostrEventUserMetadata
  | NostrEventNote
  | NostrEventComment
  | NostrEventFollow
  | NostrEventRepost
  | NostrEventRelayList
  | NostrEventZapReceipt
  | NostrEventRelayDiscovery
  | NostrEventGeneric
