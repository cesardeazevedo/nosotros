import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import type { NostrEvent } from 'core/types'
import type { Metadata } from '../../nostr/types'
import { parseContent } from './parseContent'
import { parseReplies } from './parseReplies'

export function parseNote(event: NostrEvent): Metadata {
  const content = parseContent(event)
  const replies = parseReplies(event)
  const relayHints = mergeRelayHints([content.relayHints || {}, replies.relayHints || {}])
  return {
    ...content,
    ...replies,
    relayHints,
  }
}
