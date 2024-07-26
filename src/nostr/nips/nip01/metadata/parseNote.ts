import { parseNoteContent } from 'content/parser'
import type { NostrEvent } from 'core/types'
import { isEventTag, isMention } from 'nostr/helpers/tags'

import { parseReferences } from 'nostr/nips/nip27.references'
import { parseImeta } from 'nostr/nips/nip92.imeta'
import type { NoteDB } from 'nostr/types'

import { getMentionedAuthors } from 'nostr/helpers/getMentionedAuthors'
import { getMentionedNotes } from 'nostr/helpers/getMentionedNotes'
import { getRelayHints } from 'nostr/helpers/getRelayHints'

export function parseNote(event: NostrEvent): NoteDB {
  const imeta = parseImeta(event.tags)
  const references = parseReferences(event)
  const contentSchema = parseNoteContent(event, references, imeta)

  const repliesTags = event.tags.filter((tag) => isEventTag(tag) && !isMention(tag))

  const mentionedNotes = getMentionedNotes(event, references)
  const mentionedAuthors = getMentionedAuthors(event, references)

  const relayHints = getRelayHints(event, references, mentionedAuthors)

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
