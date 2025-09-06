import type { RelayHints } from '@/core/types'
import type { ContentSchema, IMetaTags } from 'nostr-editor'
import type { UserRelay } from '../hooks/parsers/parseRelayList'
import type { UserSchema } from '../hooks/parsers/parseUser'
import type { Bolt11 } from '../hooks/parsers/parseZap'

export * from '../hooks/parsers/parseRelayList'

export const metadataSymbol = Symbol('metadata')

export type MetadataSymbol<T> = { metadata: T }

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
}
