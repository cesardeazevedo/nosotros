import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import type { ContentSchema, IMetaTags, NostrStorage } from 'nostr-editor'
import { NostrExtension } from 'nostr-editor'
import type { NostrEvent } from 'nostr-tools'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import type { Metadata } from '../types'
import { getHintsFromNIP19 } from './getHintsFromNIP19'
import { getMentionedAuthors } from './getMentionedAuthors'
import { getMentionedNotes } from './getMentionedNotes'
import { parseTags } from './parseTags'

const editor = new Editor({
  extensions: [
    StarterKit,
    MarkdownExtension.configure({ breaks: true }),
    NostrExtension.configure({ nsecReject: false, link: { autolink: true } }),
  ],
})

export function parseArticle(event: NostrEvent): Metadata {
  const tags = parseTags(event.tags)

  editor.commands.setEventContent(event)
  const extension = editor.storage.nostr as NostrStorage
  const imeta = editor.storage.nostr.imeta as IMetaTags
  const contentSchema = editor.getJSON() as ContentSchema
  const nprofiles = extension.getNprofiles()
  const nevents = extension.getNevents()
  const naddress = extension.getNaddrs()
  const mentionedNotes = getMentionedNotes(tags, nevents, naddress)
  const mentionedAuthors = getMentionedAuthors(tags, nprofiles, nevents, naddress)
  const relayHints = getHintsFromNIP19(nevents, nprofiles, naddress)
  const content = {
    imeta,
    contentSchema,
    mentionedAuthors,
    mentionedNotes,
    relayHints,
  }

  return {
    tags,
    isRoot: true,
    ...content,
  }
}
