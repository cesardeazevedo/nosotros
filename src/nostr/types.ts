import type { ContentSchema } from 'content/types'
import type { RelayHints } from 'core/types'
import type { EventDB } from 'db/types'
import type { UserMetaData } from 'nostr/nips/nip01/metadata/parseUser'
import type { NostrReference } from 'nostr/nips/nip27.references'
import type { IMetaTags } from './nips/nip92.imeta'

export interface NoteDB extends EventDB {
  metadata: {
    imeta: IMetaTags
    references: NostrReference[]
    contentSchema: ContentSchema
    relayHints: RelayHints
    mentionedAuthors: string[]
    mentionedNotes: string[]
    isRoot: boolean
    isRootReply: boolean
    isReplyOfAReply: boolean
    rootNoteId: string | undefined
    parentNoteId: string | undefined
  }
}

export interface UserDB extends EventDB {
  metadata: UserMetaData
}

export interface ZapDB extends EventDB {
  metadata: {
    bolt11: {
      amount: {
        value: string
        letters: string
      }
      separator: {
        letters: string
        value: string
      }
      timestamp: {
        letters: string
        value: number
      }
      payment_hash: {
        letters: string
        value: string
      }
    }
  }
}
