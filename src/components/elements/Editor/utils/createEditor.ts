import { settingsAtom } from '@/atoms/settings.atoms'
import { store } from '@/atoms/store'
import { NEventEditor } from '@/components/elements/Content/NEvent/NEventEditor'
import { NProfileEditor } from '@/components/elements/Content/NProfile/NProfileEditor'
import { TweetEditor } from '@/components/elements/Content/Tweet/TweetEditor'
import { YoutubeEditor } from '@/components/elements/Content/Youtube/YoutubeEditor'
import type { BlossomOptions } from '@/utils/uploadBlossom'
import { uploadBlossom } from '@/utils/uploadBlossom'
import type { NIP96Options } from '@/utils/uploadNIP96'
import { uploadNIP96 } from '@/utils/uploadNIP96'
import { hashFile } from '@/utils/utils'
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
  onUploadStart: () => void
  onUploadDrop: () => void
  onUploadComplete: () => void
  onUploadError: () => void
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
        image: {},
        video: {},
        fileUpload: {
          immediateUpload: false,
          upload: async (attrs) => {
            const { defaultUploadType, defaultUploadUrl } = store.get(settingsAtom)
            const data: BlossomOptions | NIP96Options = {
              ...attrs,
              hash: hashFile,
              sign: (event) => options.sign(event),
              serverUrl: defaultUploadUrl,
            }
            try {
              if (defaultUploadType === 'nip96') {
                return await uploadNIP96(data)
              } else {
                return await uploadBlossom(data)
              }
            } catch (error) {
              options.onUploadError()
              return {
                error: String(error),
              }
            }
          },
          onStart() {
            options.onUploadStart()
          },
          onDrop() {
            options.onUploadDrop()
          },
          onComplete() {
            options.onUploadComplete()
          },
          onUploadError() {
            options.onUploadError()
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
