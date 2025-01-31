import { Kind } from '@/constants/kinds'
import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import type { MetadataDB } from '@/db/types'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import type { NostrEvent } from 'core/types'
import { NostrExtension } from 'nostr-editor'
import type { ContentMetadata } from './parseContent'
import { parseContent } from './parseContent'
import type { RepliesMetadata } from './parseReplies'
import { parseReplies } from './parseReplies'
import type { ParsedTags } from './parseTags'
import { parseTags } from './parseTags'

type Note = {
  kind: Kind.Text | Kind.Article
  tags: ParsedTags
}

export type NoteMetadata = MetadataDB & ContentMetadata & RepliesMetadata & Note

export const editor = new Editor({
  extensions: [StarterKit.configure({ history: false }), NostrExtension.configure({ nsecReject: false })],
})

export function parseNote(event: NostrEvent): NoteMetadata {
  const tags = parseTags(event.tags)
  const content = parseContent(event, tags)
  const replies = parseReplies(tags)
  const relayHints = mergeRelayHints([content.relayHints, replies.relayHints])
  return {
    id: event.id,
    kind: Kind.Text,
    ...content,
    ...replies,
    relayHints,
    tags,
  }
}
