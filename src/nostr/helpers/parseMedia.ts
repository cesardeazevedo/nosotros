import { Kind } from '@/constants/kinds'
import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import type { MetadataDB } from '@/db/types'
import type { NostrEvent } from 'core/types'
import type { ContentMetadata } from './parseContent'
import { parseContent } from './parseContent'
import type { ParsedTags } from './parseTags'
import { parseTags } from './parseTags'

type Media = {
  kind: Kind.Media
  tags: ParsedTags
}

export type MediaMetadata = MetadataDB & ContentMetadata & Media

export function parseMedia(event: NostrEvent): MediaMetadata {
  const tags = parseTags(event.tags)
  const content = parseContent(event, tags)
  const relayHints = mergeRelayHints([content.relayHints])
  return {
    id: event.id,
    kind: Kind.Media,
    ...content,
    relayHints,
    tags,
  }
}
