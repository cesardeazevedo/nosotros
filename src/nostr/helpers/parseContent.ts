import type { NostrEvent, RelayHints } from '@/core/types'
import type { Editor } from '@tiptap/core'
import type { ContentSchema, IMetaTags, NostrStorage } from 'nostr-editor'
import { getHintsFromNIP19 } from './getHintsFromNIP19'
import { getMentionedAuthors } from './getMentionedAuthors'
import { getMentionedNotes } from './getMentionedNotes'
import { type ParsedTags } from './parseTags'

export interface ContentMetadata {
  imeta: IMetaTags
  contentSchema: ContentSchema
  mentionedAuthors: string[]
  mentionedNotes: string[]
  relayHints: Partial<RelayHints>
}

export function parseContent(editor: Editor, event: NostrEvent, tags: ParsedTags): ContentMetadata {
  editor.commands.setEventContent(event)
  const extension = editor.storage.nostr as NostrStorage
  const imeta = editor.storage.nostr.imeta as IMetaTags
  const contentSchema = editor.getJSON() as ContentSchema
  const nprofiles = extension.getNprofiles()
  const nevents = extension.getNevents()
  const naddress = extension.getNaddress()
  const mentionedNotes = getMentionedNotes(tags, nevents, naddress)
  const mentionedAuthors = getMentionedAuthors(tags, nprofiles, nevents, naddress)
  const relayHints = getHintsFromNIP19(nevents, nprofiles, naddress)
  return {
    imeta,
    contentSchema,
    mentionedNotes,
    mentionedAuthors,
    relayHints,
  }
}
