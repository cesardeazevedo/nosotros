import type { NostrEvent } from 'nostr-tools'
import type { Metadata } from '../../nostr/types'
import { parseRelayHintsFromTags } from './parseRelayHints'
import { isEventTag } from './parseTags'

export function parseRepost(event: NostrEvent): Metadata {
  const hints = parseRelayHintsFromTags(event)
  const mentionedNotes = event.tags.filter(isEventTag).map((tag) => tag[1])
  return {
    relayHints: hints,
    mentionedNotes,
    // mentionedNotes: tags.e?.[0].slice(1, 2) || [],
  }
}
