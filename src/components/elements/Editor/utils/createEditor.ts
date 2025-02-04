import { NEventEditor } from '@/components/elements/Content/NEvent/NEventEditor'
import { NProfileEditor } from '@/components/elements/Content/NProfile/NProfileEditor'
import { TweetEditor } from '@/components/elements/Content/Tweet/TweetEditor'
import { YoutubeEditor } from '@/components/elements/Content/Youtube/YoutubeEditor'
import type { EditorStore } from '@/stores/editor/editor.store'
import type { NodeViewProps } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import { ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { NostrExtension } from 'nostr-editor'
import { ImageNodeViewWrapper } from '../../Content/Image/ImageNodeViewWrapper'
import { NAddrEditor } from '../../Content/NAddr/NAddrEditor'
import { VideoNodeViewWrapper } from '../../Content/Video/VideoNodeViewWrapper'
import { createSuggestionPlugin } from './createSuggestionPlugin'

const addNodeView = (Component: React.ComponentType<NodeViewProps>) => ({
  addNodeView: () => ReactNodeViewRenderer(Component),
})

export function createEditor(store: EditorStore) {
  return new Editor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: store.placeholder }),
      NostrExtension.configure({
        link: {
          openOnClick: false,
        },
        image: {
          defaultUploadUrl: 'https://nostr.build',
          defaultUploadType: 'nip96',
          // defaultUploadUrl: 'http://localhost:3000',
          // defaultUploadType: 'blossom',
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
