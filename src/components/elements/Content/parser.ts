import ImageExtension from '@tiptap/extension-image'
import YoutubeExtension from '@tiptap/extension-youtube'
import StarterKit from '@tiptap/starter-kit'

import { Editor, type Extensions } from '@tiptap/react'
import { Kind } from 'constants/kinds'
import type { Event as NostrEvent } from 'nostr-tools'
import type { IMeta } from 'stores/core/imeta'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import type { NostrReference } from 'utils/references'
import { AutoMatcherExtension } from './AutoMatcherExtension'
import { addImageNodeView } from './Image/ImageEditor'
import { LinkExtension } from './Link/LinkExtension'
import { MentionExtension } from './Mention/MentionExtension'
import { NoteExtension } from './Note/NoteExtension'
import { TagExtension } from './Tag/TagExtension'
import { TweetExtension } from './Tweet/TweetExtension'
import { VideoExtension } from './Video/VideoExtension'
import type { StateJSONSchema } from './types'

const extensions: Extensions = [
  StarterKit.configure({ history: false }),
  TagExtension,
  LinkExtension,
  NoteExtension,
  ImageExtension.extend(addImageNodeView()),
  VideoExtension,
  TweetExtension,
  YoutubeExtension,
  MentionExtension,
  AutoMatcherExtension,
]

const editor = new Editor({ extensions })
const editorMarkdown = new Editor({ extensions: [...extensions, MarkdownExtension] })

export function parseNote(event: NostrEvent, references?: NostrReference[], imeta?: IMeta): StateJSONSchema {
  const _editor = event.kind === Kind.Article ? editorMarkdown : editor
  _editor.storage.imeta = imeta
  _editor.storage.references = references
  _editor.commands.setContent(event.kind === Kind.Text ? event.content.replace(/\n+/g, '<br />') : event.content)
  return _editor.getJSON() as StateJSONSchema
}

export function parseUserAbout(about: string): StateJSONSchema {
  editor.storage.references = null
  editor.commands.setContent(about)
  return editor.getJSON() as StateJSONSchema
}
