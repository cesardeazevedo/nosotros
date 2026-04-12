import { NProfileEditor } from '@/components/elements/Content/NProfile/NProfileEditor'
import { EmojiExtension } from '@/components/elements/Content/Emoji/EmojiExtension'
import DocumentExtension from '@tiptap/extension-document'
import HardbreakExtension from '@tiptap/extension-hard-break'
import HistoryExtension from '@tiptap/extension-history'
import ParagraphExtension from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import TextExtension from '@tiptap/extension-text'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { NostrExtension, editorProps } from 'nostr-editor'
import { createSuggestionPlugin } from './createSuggestionPlugin'

export function createEditorInline(
  placeholder: string,
  resolveEmoji: (name: string) => { name: string; src: string } | null = () => null,
  getEmojiSuggestions: (query: string) => Array<{ name: string; src: string }> = () => [],
) {
  return {
    editorProps,
    extensions: [
      TextExtension,
      DocumentExtension,
      ParagraphExtension,
      HardbreakExtension,
      HistoryExtension,
      Placeholder.configure({ placeholder }),
      EmojiExtension.configure({
        resolveEmoji,
        getEmojiSuggestions,
      }),
      NostrExtension.configure({
        link: {
          openOnClick: false,
        },
        image: false,
        video: false,
        fileUpload: false,
        nevent: false,
        naddr: false,
        bolt11: false,
        youtube: false,
        tweet: false,
        extend: {
          nprofile: {
            addNodeView: () => ReactNodeViewRenderer(NProfileEditor),
            addProseMirrorPlugins() {
              return [createSuggestionPlugin(this.editor)]
            },
          },
        },
      }),
    ],
  }
}
