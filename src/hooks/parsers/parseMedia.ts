import type { NostrEvent } from 'nostr-tools'
import type { Metadata } from '../../nostr/types'
import { parseContent } from './parseContent'

export function parseMedia(event: NostrEvent): Metadata {
  const content = parseContent(event)
  return {
    ...content,
  }
}
