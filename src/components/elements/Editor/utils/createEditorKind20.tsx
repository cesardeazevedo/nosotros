import { NProfileEditor } from '@/components/elements/Content/NProfile/NProfileEditor'
import DocumentExtension from '@tiptap/extension-document'
import HardbreakExtension from '@tiptap/extension-hard-break'
import HistoryExtension from '@tiptap/extension-history'
import ParagraphExtension from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import TextExtension from '@tiptap/extension-text'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { NostrExtension } from 'nostr-editor'
import { createSuggestionPlugin } from './createSuggestionPlugin'

// For kind-20,
export function createEditorKind20(placeholder: string) {
  return {
    extensions: [
      TextExtension,
      DocumentExtension,
      ParagraphExtension,
      HardbreakExtension,
      HistoryExtension,
      Placeholder.configure({ placeholder }),
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
