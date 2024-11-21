import { mergeRelayHints } from '@/core/mergers/mergeRelayHints'
import { parseNoteContent } from 'content/parser'
import type { NostrEvent } from 'core/types'
import { getMentionedAuthors } from 'nostr/helpers/getMentionedAuthors'
import { getMentionedNotes } from 'nostr/helpers/getMentionedNotes'
import { getRelayHintsFromNIP19 } from 'nostr/helpers/getRelayHints'
import { isMention, parseTags } from '@/nostr/helpers/parseTags'
import type { NoteMetadataDB } from 'nostr/types'

export function parseNote(event: NostrEvent) {
  const { contentSchema, imeta, nevents, nprofiles } = parseNoteContent(event)
  const { hints = {}, ...tags } = parseTags(event.tags)

  const repliesTags = tags.e?.filter((tag) => !isMention(tag)) || []

  const mentionedNotes = getMentionedNotes(tags, nevents)
  const mentionedAuthors = getMentionedAuthors(tags, nprofiles, nevents)
  const relayHints = mergeRelayHints([hints, getRelayHintsFromNIP19(nevents, nprofiles)])

  const isRoot = repliesTags.length === 0
  const isRootReply = repliesTags.length === 1
  const isReplyOfAReply = repliesTags.length > 1
  const rootNoteId = !isRoot ? repliesTags[0][1] : undefined
  const parentNoteId = repliesTags[repliesTags.length - 1]?.[1] || undefined

  return {
    id: event.id,
    kind: event.kind,
    imeta,
    contentSchema,
    relayHints,
    mentionedNotes,
    mentionedAuthors,
    tags,
    rootNoteId,
    parentNoteId,
    isRoot,
    isRootReply,
    isReplyOfAReply,
    lastSyncedAt: 0,
  } as NoteMetadataDB
}
