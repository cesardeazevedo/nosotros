import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Kind } from 'constants/kinds'
import type {
  ContentSchema,
  IMetaTags,
  NAddrAttributes,
  NEventAttributes,
  NProfileAttributes,
  NostrStorage,
} from 'nostr-editor'
import { NEventExtension, NostrExtension } from 'nostr-editor'
import type { NostrEvent } from 'nostr-tools'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'

export const editorText = new Editor({
  extensions: [
    StarterKit.configure({ history: false }),
    NostrExtension.configure({
      nsecReject: false,
    }),
  ],
})

export const editorKind0 = new Editor({
  extensions: [
    StarterKit.configure({ history: false }),
    NostrExtension.configure({
      image: false,
      video: false,
      nevent: false,
      youtube: false,
      tweet: false,
      nsecReject: false,
    }),
    NEventExtension.extend({
      inline: true,
      group: 'inline',
    }),
  ],
})

export const editorMarkdown = new Editor({
  extensions: [
    StarterKit,
    MarkdownExtension.configure({ breaks: true }),
    NostrExtension.configure({ nsecReject: false, link: { autolink: true } }),
  ],
})

type Response = {
  imeta: IMetaTags
  contentSchema: ContentSchema
  nprofiles: NProfileAttributes[]
  nevents: NEventAttributes[]
  naddress: NAddrAttributes[]
}

export function parseNoteContent(event: NostrEvent): Response {
  const editor = event.kind === Kind.Article ? editorMarkdown : editorText
  editor.commands.setEventContent(event)
  const contentSchema = editor.getJSON() as ContentSchema
  const extension = editor.storage.nostr as NostrStorage
  const nprofiles = extension.getNprofiles()
  const nevents = extension.getNevents()
  const naddress = extension.getNaddress()
  const imeta = editor.storage.nostr.imeta as IMetaTags
  return { imeta, contentSchema, nprofiles, nevents, naddress }
}

export function parseUserAbout(event: NostrEvent): ContentSchema {
  editorKind0.commands.setEventContentKind0(event)
  return editorKind0.getJSON() as ContentSchema
}
