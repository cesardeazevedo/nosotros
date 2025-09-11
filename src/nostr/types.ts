import type { RelayHints } from '@/core/types'
import type { ContentSchema, ImageNode, IMetaTags, Node, VideoNode } from 'nostr-editor'
import type { UserRelay } from '../hooks/parsers/parseRelayList'
import type { UserSchema } from '../hooks/parsers/parseUser'
import type { Bolt11 } from '../hooks/parsers/parseZap'

export * from '../hooks/parsers/parseRelayList'

export const metadataSymbol = Symbol('metadata')

export type MetadataSymbol<T> = { metadata: T }

export type ImageCustomNode = ImageNode & {
  index: number
}

export type VideoCustomNode = VideoNode & {
  index: number
}

export type CustomNode =
  | Node
  | {
      type: 'mediaGroup'
      content: Array<ImageCustomNode | VideoCustomNode>
    }

export type ContentCustomSchema = Omit<ContentSchema, 'content'> & {
  content: Array<CustomNode>
}

export type Metadata = {
  imeta?: IMetaTags
  isRoot?: boolean
  rootId?: string
  parentId?: string
  userMetadata?: UserSchema
  contentSchema?: ContentCustomSchema
  mentionedNotes?: string[]
  mentionedAuthors?: string[]
  bolt11?: Bolt11
  relayList?: UserRelay[]
  relayHints?: Partial<RelayHints>
}
