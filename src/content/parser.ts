import ImageExtension from '@tiptap/extension-image'
import YoutubeExtension from '@tiptap/extension-youtube'
import StarterKit from '@tiptap/starter-kit'

import { Editor, type Extensions } from '@tiptap/react'
import { Kind } from 'constants/kinds'
import {
  AutoMatcherExtension,
  LinkExtension,
  MentionExtension,
  NoteExtension,
  TagExtension,
  TweetExtension,
  VideoExtension,
} from 'content'

import type { NostrEvent } from 'core/types'
import type { NostrReference } from 'nostr/nips/nip27.references'
import type { IMetaFields } from 'nostr/nips/nip92.imeta'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import type { ContentSchema } from './types'

const extensions: Extensions = [
  StarterKit.configure({ history: false }),
  TagExtension,
  LinkExtension,
  NoteExtension,
  ImageExtension,
  VideoExtension,
  TweetExtension,
  YoutubeExtension,
  MentionExtension,
  AutoMatcherExtension.configure({}),
]

const editor = new Editor({ extensions })
const editorMarkdown = new Editor({ extensions: [...extensions, MarkdownExtension] })

export function parseNoteContent(event: NostrEvent, references?: NostrReference[], imeta?: IMetaFields): ContentSchema {
  const _editor = event.kind === Kind.Article ? editorMarkdown : editor
  _editor.storage.event = event
  _editor.storage.imeta = imeta
  _editor.storage.references = references
  _editor.commands.setContent(event.kind === Kind.Text ? event.content.replace(/\n+/g, '<br />') : event.content)
  return _editor.getJSON() as ContentSchema
}

export function parseUserAbout(about: string): ContentSchema {
  editor.storage.references = null
  editor.commands.setContent(about)
  return editor.getJSON() as ContentSchema
}
