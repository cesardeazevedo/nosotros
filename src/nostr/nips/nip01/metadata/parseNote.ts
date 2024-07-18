import { parseNoteContent } from 'content/parser'
import { mergeRelayHints } from 'core/mergers/mergeRelayHints'
import type { NostrEvent } from 'core/types'
import { parseReferences } from 'nostr/nips/nip27.references'
import { parseImeta } from 'nostr/nips/nip92.imeta'
import type { NoteDB } from 'nostr/types'
import {
  getMentionedAuthors,
  getMentionedNotes,
  getRelayHintsFromReferences,
  getRelayHintsFromTags,
  isAuthorTag,
  isEventTag,
  isMention,
} from './parseTags'

export function parseNote(event: NostrEvent): NoteDB {
  const imeta = parseImeta(event.tags)
  const references = parseReferences(event)
  const contentSchema = parseNoteContent(event, references, imeta)

  const repliesTags = event.tags.filter((tag) => isEventTag(tag) && !isMention(tag))
  const authorsTags = event.tags.filter((tag) => isAuthorTag(tag))

  const mentionedNotes = getMentionedNotes(event, references)
  const mentionedAuthors = getMentionedAuthors(event, references, authorsTags)
  const hintTags = getRelayHintsFromTags(event)
  const hintRefs = getRelayHintsFromReferences(references, mentionedAuthors)

  const relayHints = mergeRelayHints([hintTags, hintRefs])

  const isRoot = repliesTags.length === 0
  const isRootReply = repliesTags.length === 1
  const isReplyOfAReply = repliesTags.length > 1
  const rootNoteId = !isRoot ? repliesTags[0][1] : undefined
  const parentNoteId = repliesTags[repliesTags.length - 1]?.[1] || undefined

  const data: NoteDB = {
    ...event,
    metadata: {
      imeta,
      references,
      contentSchema,
      relayHints,
      mentionedNotes,
      mentionedAuthors,
      rootNoteId,
      parentNoteId,
      isRoot,
      isRootReply,
      isReplyOfAReply,
    },
  }

  return data
}
