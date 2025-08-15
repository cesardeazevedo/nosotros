import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import type { ContentSchema, IMetaTags, NostrStorage } from 'nostr-editor'
import { NostrExtension } from 'nostr-editor'
import type { NostrEvent } from 'nostr-tools'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import type { Metadata } from '../../nostr/types'
import { getMentionedAuthors } from './getMentionedAuthors'
import { getMentionedNotes } from './getMentionedNotes'
import { parseRelayHintsFromNIP19 } from './parseRelayHints'

const editor = new Editor({
  extensions: [
    StarterKit,
    MarkdownExtension.configure({ breaks: true }),
    NostrExtension.configure({ nsecReject: false, link: { autolink: true } }),
  ],
})

export function parseArticle(event: NostrEvent): Metadata {
  editor.commands.setEventContent(event)
  const extension = editor.storage.nostr as NostrStorage
  const imeta = editor.storage.nostr.imeta as IMetaTags
  const contentSchema = editor.getJSON() as ContentSchema
  const nprofiles = extension.getNprofiles()
  const nevents = extension.getNevents()
  const naddress = extension.getNaddrs()
  const mentionedNotes = getMentionedNotes(event.tags, nevents, naddress)
  const mentionedAuthors = getMentionedAuthors(event.tags, nprofiles, nevents, naddress)
  const relayHints = parseRelayHintsFromNIP19(nevents, nprofiles, naddress)
  const content = {
    imeta,
    contentSchema,
    mentionedAuthors,
    mentionedNotes,
    relayHints,
  }

  return {
    isRoot: true,
    ...content,
  }
}
