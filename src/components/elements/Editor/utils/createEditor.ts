import { NEventEditor } from '@/components/elements/Content/NEvent/NEventEditor'
import { NProfileEditor } from '@/components/elements/Content/NProfile/NProfileEditor'
import { TweetEditor } from '@/components/elements/Content/Tweet/TweetEditor'
import { YoutubeEditor } from '@/components/elements/Content/Youtube/YoutubeEditor'
import type { NodeViewProps } from '@tiptap/core'
import DocumentExtension from '@tiptap/extension-document'
import DropCursorExtension from '@tiptap/extension-dropcursor'
import GapcursorExtension from '@tiptap/extension-gapcursor'
import HardbreakExtension from '@tiptap/extension-hard-break'
import HistoryExtension from '@tiptap/extension-history'
import ParagraphExtension from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import TextExtension from '@tiptap/extension-text'
import type { UseEditorOptions } from '@tiptap/react'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { NostrExtension, editorProps } from 'nostr-editor'
import type { EventTemplate, NostrEvent } from 'nostr-tools'
import { ImageNodeViewWrapper } from '../../Content/Image/ImageNodeViewWrapper'
import { NAddrEditor } from '../../Content/NAddr/NAddrEditor'
import { VideoNodeViewWrapper } from '../../Content/Video/VideoNodeViewWrapper'
import { createSuggestionPlugin } from './createSuggestionPlugin'

const addNodeView = (Component: React.ComponentType<NodeViewProps>) => ({
  addNodeView: () => ReactNodeViewRenderer(Component),
})

type Options = {
  sign: (unsigned: EventTemplate) => Promise<NostrEvent>
  placeholder: () => string
  defaultUploadUrl: string
  defaultUploadType: string
  onUploadStart: () => void
  onUploadDrop: () => void
  onUploadComplete: () => void
}

export function createEditor(options: Options): UseEditorOptions {
  return {
    editorProps,
    extensions: [
      TextExtension,
      DocumentExtension,
      ParagraphExtension,
      HardbreakExtension,
      HistoryExtension,
      DropCursorExtension,
      GapcursorExtension,
      Placeholder.configure({ placeholder: options.placeholder }),
      NostrExtension.configure({
        link: {
          openOnClick: false,
        },
        image: {
          defaultUploadUrl: options.defaultUploadUrl || 'https://nostr.build',
          defaultUploadType: (options.defaultUploadType || 'nip96') as 'nip96' | 'blossom',
        },
        video: {
          defaultUploadUrl: 'https://nostr.build',
          defaultUploadType: 'nip96',
        },
        fileUpload: {
          immediateUpload: false,
          sign: (event) => options.sign(event),
          onStart() {
            options.onUploadStart()
          },
          onDrop() {
            options.onUploadDrop()
          },
          onComplete() {
            options.onUploadComplete()
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
  }
}
