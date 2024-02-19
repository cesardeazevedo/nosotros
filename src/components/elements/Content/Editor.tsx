import ImageExtension from '@tiptap/extension-image'
import YoutubeExtension from '@tiptap/extension-youtube'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { AutoMatcherExtension } from './AutoMatcherExtension'
import { addImageNodeView } from './Image/ImageEditor'
import { LinkExtension } from './Link/LinkExtension'
import { MentionExtension } from './Mention/MentionExtension'
import { NoteExtension } from './Note/NoteExtension'
import { TagExtension } from './Tag/TagExtension'
import { TweetExtension } from './Tweet/TweetExtension'
import { VideoExtension } from './Video/VideoExtension'

function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TagExtension,
      LinkExtension,
      ImageExtension.extend(addImageNodeView()),
      NoteExtension,
      MentionExtension,
      VideoExtension,
      TweetExtension,
      YoutubeExtension,
      AutoMatcherExtension,
    ],
  })

  return <EditorContent editor={editor} />
}

export default Editor
