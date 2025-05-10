import type { RelayHints } from '@/core/types'
import type { ContentSchema, IMetaTags } from 'nostr-editor'
import type { NostrEvent } from 'nostr-tools'
import type { UserRelay } from './helpers/parseRelayList'
import type { ParsedTags } from './helpers/parseTags'
import type { UserSchema } from './helpers/parseUser'
import type { Bolt11 } from './helpers/parseZap'

export * from './helpers/parseRelayList'

export const metadataSymbol = Symbol('metadata')

export type MetadataSymbol<T> = { [metadataSymbol]: T }

export type Metadata = {
  imeta?: IMetaTags
  isRoot?: boolean
  rootId?: string
  parentId?: string
  userMetadata?: UserSchema
  contentSchema?: ContentSchema
  mentionedNotes?: string[]
  mentionedAuthors?: string[]
  bolt11?: Bolt11
  relayList?: UserRelay[]
  relayHints?: Partial<RelayHints>
  tags?: ParsedTags
}

export type NostrEventMetadata = NostrEvent & MetadataSymbol<Metadata>
