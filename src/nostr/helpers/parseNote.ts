import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import type { NostrEvent } from 'core/types'
import type { Metadata } from '../types'
import { parseContent } from './parseContent'
import { parseReplies } from './parseReplies'
import { parseTags } from './parseTags'

export function parseNote(event: NostrEvent): Metadata {
  const tags = parseTags(event.tags)
  const content = parseContent(event, tags)
  const replies = parseReplies(tags)
  const relayHints = mergeRelayHints([content.relayHints || {}, replies.relayHints || {}])
  return {
    ...content,
    ...replies,
    relayHints,
    tags,
  }
}
