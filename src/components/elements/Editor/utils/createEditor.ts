import { NEventEditor } from '@/components/elements/Content/NEvent/NEventEditor'
import { NProfileEditor } from '@/components/elements/Content/NProfile/NProfileEditor'
import { TweetEditor } from '@/components/elements/Content/Tweet/TweetEditor'
import { YoutubeEditor } from '@/components/elements/Content/Youtube/YoutubeEditor'
import type { EditorStore } from '@/stores/editor/editor.store'
import type { NodeViewProps } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import DocumentExtension from '@tiptap/extension-document'
import DropCursorExtension from '@tiptap/extension-dropcursor'
import GapcursorExtension from '@tiptap/extension-gapcursor'
import HardbreakExtension from '@tiptap/extension-hard-break'
import HistoryExtension from '@tiptap/extension-history'
import ParagraphExtension from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import TextExtension from '@tiptap/extension-text'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { NostrExtension } from 'nostr-editor'
import { ImageNodeViewWrapper } from '../../Content/Image/ImageNodeViewWrapper'
import { NAddrEditor } from '../../Content/NAddr/NAddrEditor'
import { VideoNodeViewWrapper } from '../../Content/Video/VideoNodeViewWrapper'
import { createSuggestionPlugin } from './createSuggestionPlugin'

const addNodeView = (Component: React.ComponentType<NodeViewProps>) => ({
  addNodeView: () => ReactNodeViewRenderer(Component),
})

type Settings = {
  defaultUploadUrl: string
  defaultUploadType: string
}

export function createEditor(store: EditorStore, settings: Settings) {
  return new Editor({
    extensions: [
      TextExtension,
      DocumentExtension,
      ParagraphExtension,
      HardbreakExtension,
      HistoryExtension,
      DropCursorExtension,
      GapcursorExtension,
      Placeholder.configure({ placeholder: store.placeholder }),
      NostrExtension.configure({
        link: {
          openOnClick: false,
        },
        image: {
          defaultUploadUrl: settings.defaultUploadUrl || 'https://nostr.build',
          defaultUploadType: (settings.defaultUploadType || 'nip96') as 'nip96' | 'blossom',
        },
        video: {
          defaultUploadUrl: 'https://nostr.build',
          defaultUploadType: 'nip96',
        },
        fileUpload: {
          immediateUpload: false,
          sign: (event) => store.sign(event),
          onStart() {
            store.isUploading.toggle(true)
          },
          onDrop() {
            store.editor?.commands.focus()
          },
          onComplete() {
            store.isUploading.toggle(false)
          },
        },
        extend: {
          image: addNodeView(ImageNodeViewWrapper),
          video: addNodeView(VideoNodeViewWrapper),
          youtube: addNodeView(YoutubeEditor),
          nprofile: {
            addNodeView: () => ReactNodeViewRenderer(NProfileEditor),
            addProseMirrorPlugins() {
              return [createSuggestionPlugin(this.editor)]
            },
          },
          naddr: addNodeView(NAddrEditor),
          nevent: addNodeView(NEventEditor),
          tweet: addNodeView(TweetEditor),
        },
      }),
    ],
    onUpdate({ editor }) {
      store.onUpdate(editor)
    },
  })
}
