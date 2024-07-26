import ImageExtension from '@tiptap/extension-image'
import YoutubeExtension from '@tiptap/extension-youtube'
import { EditorContent, ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  AutoMatcherExtension,
  LinkExtension,
  MentionExtension,
  NoteExtension,
  TagExtension,
  TweetExtension,
  VideoExtension,
} from 'content'

import ImageEditor from './Image/ImageEditor'
import MentionEditor from './Mention/MentionEditor'
import NoteEditor from './Note/NoteEditor'
import TweetEditor from './Tweet/TweetEditor'
import VideoEditor from './Video/VideoEditor'

export function addNodeView(Component: unknown) {
  return {
    addNodeView() {
      return ReactNodeViewRenderer(Component)
    },
  }
}

function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TagExtension,
      LinkExtension,
      ImageExtension.extend(addNodeView(ImageEditor)),
      NoteExtension.extend(addNodeView(NoteEditor)),
      MentionExtension.extend(addNodeView(MentionEditor)),
      VideoExtension.extend(addNodeView(VideoEditor)),
      TweetExtension.extend(addNodeView(TweetEditor)),
      YoutubeExtension,
      AutoMatcherExtension,
    ],
  })

  return <EditorContent editor={editor} />
}

export default Editor
