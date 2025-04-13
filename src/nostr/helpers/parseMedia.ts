import type { NostrEvent } from 'core/types'
import type { Metadata } from '../types'
import { parseContent } from './parseContent'
import { parseTags } from './parseTags'

export function parseMedia(event: NostrEvent): Metadata {
  const tags = parseTags(event.tags)
  const content = parseContent(event, tags)
  return {
    ...content,
    tags,
  }
}
