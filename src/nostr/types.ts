import type { MetadataDB } from '@/db/types'
import type { RelayHints } from 'core/types'
import type { ContentSchema, IMetaTags } from 'nostr-editor'
import type { ParsedTags } from './helpers/parseTags'
import type { UserMetadata } from './nips/nip01/metadata/parseUser'

export interface NoteMetadataDB extends MetadataDB {
  contentSchema: ContentSchema
  imeta: IMetaTags
  mentionedAuthors: string[]
  mentionedNotes: string[]
  tags: ParsedTags
  relayHints: Partial<RelayHints>
  isRoot: boolean
  isRootReply: boolean
  isReplyOfAReply: boolean
  rootNoteId: string | undefined
  parentNoteId: string | undefined
  lastSyncedAt: number | undefined
}

export interface RepostDB extends MetadataDB {
  tags: ParsedTags
  relayHints: Partial<RelayHints>
  mentionedNotes: string[]
}

export type UserMetadataDB = MetadataDB & UserMetadata

export interface ZapMetadataDB extends MetadataDB {
  tags: ParsedTags
  bolt11: {
    amount?: {
      value: string
      letters: string
    }
    separator?: {
      letters: string
      value: string
    }
    timestamp?: {
      letters: string
      value: number
    }
    payment_hash?: {
      letters: string
      value: string
    }
  }
}
