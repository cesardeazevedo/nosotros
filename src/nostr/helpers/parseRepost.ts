import type { Kind } from '@/constants/kinds'
import type { RelayHints } from '@/core/types'
import type { MetadataDB } from '@/db/types'
import type { NostrEvent } from 'nostr-tools'
import type { ParsedTags } from './parseTags'
import { parseTags } from './parseTags'

export interface RepostMetadata extends MetadataDB {
  kind: Kind.Repost
  tags: ParsedTags
  relayHints: Partial<RelayHints>
  mentionedNotes: string[]
}

export function parseRepost(event: NostrEvent): RepostMetadata {
  const { hints = {}, ...tags } = parseTags(event.tags)
  return {
    id: event.id,
    kind: event.kind,
    tags,
    relayHints: hints,
    mentionedNotes: tags.e?.[0].slice(1, 2) || [],
  }
}
