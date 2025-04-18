import type { NostrEvent } from 'nostr-tools'
import { parseTags } from './parseTags'
import type { Metadata } from '../types'

export function parseRepost(event: NostrEvent): Metadata {
  const { hints = {}, ...tags } = parseTags(event.tags)
  return {
    tags,
    relayHints: hints,
    mentionedNotes: tags.e?.[0].slice(1, 2) || [],
  }
}
