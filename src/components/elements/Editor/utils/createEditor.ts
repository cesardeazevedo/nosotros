import { NEventEditor } from '@/components/elements/Content/NEvent/NEventEditor'
import { NProfileEditor } from '@/components/elements/Content/NProfile/NProfileEditor'
import { SpotifyEditor } from '@/components/elements/Content/Spotify/SpotifyEditor'
import { SpotifyExtension } from '@/components/elements/Content/Spotify/SpotifyExtension'
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
import { ImageNodeViewWrapper } from '../../Content/Image/ImageNodeViewWrapper'
import { NAddrEditor } from '../../Content/NAddr/NAddrEditor'
import { VideoNodeViewWrapper } from '../../Content/Video/VideoNodeViewWrapper'
import { createSuggestionPlugin } from './createSuggestionPlugin'

const addNodeView = (Component: React.ComponentType<NodeViewProps>) => ({
  addNodeView: () => ReactNodeViewRenderer(Component),
})

const addImageNodeView = (Component: React.ComponentType<NodeViewProps>) => ({
  addNodeView: () => ReactNodeViewRenderer(Component),
  addAttributes(this: { parent?: () => Record<string, unknown> }) {
    return {
      ...(this.parent?.() ?? {}),
      quality: { default: 'high' },
    }
  },
})
const addVideoNodeView = (Component: React.ComponentType<NodeViewProps>) => ({
  addNodeView: () => ReactNodeViewRenderer(Component),
  addAttributes(this: { parent?: () => Record<string, unknown> }) {
    return {
      ...(this.parent?.() ?? {}),
      quality: { default: 'high' },
      includeAudio: { default: true },
    }
  },
})

type Options = {
  placeholder: () => string
  onFilesSelect: (files: File[], pos?: number) => void
}

export function createEditor(options: Options): UseEditorOptions {
  const isMediaFile = (file: File) => {
    return file.type.startsWith('image/') || file.type.startsWith('video/')
  }
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
        extend: {
          image: addImageNodeView(ImageNodeViewWrapper),
          video: addVideoNodeView(VideoNodeViewWrapper),
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
      SpotifyExtension.configure({
        HTMLAttributes: {
          class: 'spotify-embed',
        },
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(SpotifyEditor)
        },
      }),
    ],
  }
}
