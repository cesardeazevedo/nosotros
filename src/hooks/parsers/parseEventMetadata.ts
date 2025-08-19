import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { compactObject } from '@/utils/utils'
import type { NostrEvent } from 'nostr-tools'
import { parseRelayList, type Metadata } from '../../nostr/types'
import { parseArticle } from './parseArticle'
import { parseComment } from './parseComment'
import { parseMedia } from './parseMedia'
import { parseNote } from './parseNote'
import { parseRepost } from './parseRepost'
import { parseUser } from './parseUser'
import { parseZapEvent } from './parseZap'

export function parseMetadata(event: NostrEvent): Metadata | null {
  switch (event.kind) {
    case Kind.Metadata:
      return parseUser(event)
    case Kind.Text:
      return parseNote(event)
    case Kind.Comment:
      return parseComment(event)
    case Kind.Article:
      return parseArticle(event)
    case Kind.Repost:
      return parseRepost(event)
    case Kind.Media:
      return parseMedia(event)
    case Kind.RelayList:
      return parseRelayList(event)
    case Kind.ZapReceipt:
      return parseZapEvent(event)
    default:
      return null
  }
}

export function parseEventMetadata(event: NostrEvent): NostrEventDB {
  return {
    ...event,
    metadata: compactObject(parseMetadata(event)),
  }
}
