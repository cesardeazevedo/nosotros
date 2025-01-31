import type { NostrEvent, RelayHints } from '@/core/types'
import { welshmanToProseMirror } from '@/utils/welshmanToProsemirror'
import type { Parsed } from '@welshman/content'
import { parse } from '@welshman/content'
import type { ContentSchema } from 'nostr-editor'
import { getHintsFromNIP19 } from './getHintsFromNIP19'
import { getMentionedAuthors } from './getMentionedAuthors'
import { getMentionedNotes } from './getMentionedNotes'
import type { IMetaTags } from './parseImeta'
import { parseImeta } from './parseImeta'
import { type ParsedTags } from './parseTags'

export interface ContentMetadata {
  imeta: IMetaTags
  schema?: Parsed[]
  contentSchema?: ContentSchema
  mentionedAuthors: string[]
  mentionedNotes: string[]
  relayHints: Partial<RelayHints>
}

export function parseContent(event: NostrEvent, tags: ParsedTags): ContentMetadata {
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
