import type { NostrEvent } from '@/core/types'
import { welshmanToProseMirror } from '@/utils/welshmanToProsemirror'
import { parse } from '@welshman/content'
import type { Metadata } from '../types'
import { getHintsFromNIP19 } from './getHintsFromNIP19'
import { getMentionedAuthors } from './getMentionedAuthors'
import { getMentionedNotes } from './getMentionedNotes'
import { parseImeta } from './parseImeta'
import { type ParsedTags } from './parseTags'

export function parseContent(event: NostrEvent, tags: ParsedTags): Metadata {
  const imeta = parseImeta(event.tags)
  const parsed = parse({ content: event.content, tags: event.tags })
  const { contentSchema, nprofiles, nevents, naddresses } = welshmanToProseMirror(parsed)

  const relayHints = getHintsFromNIP19(nevents, nprofiles, naddresses)
  const mentionedNotes = getMentionedNotes(tags, nevents, naddresses)
  const mentionedAuthors = getMentionedAuthors(tags, nprofiles, nevents, naddresses)

  return {
    imeta,
    contentSchema,
    mentionedNotes,
    mentionedAuthors,
    relayHints,
  }
}
