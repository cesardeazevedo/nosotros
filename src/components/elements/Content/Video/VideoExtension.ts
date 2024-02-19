import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { VideoEditor } from './VideoEditor'

export interface VideoExtensionAttributes {
  src: string
}

export const VideoExtension = Node.create({
  name: 'video',

  inline: false,

  inclusive: false,

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEditor)
  },

  renderHTML() {
    return ['a', {}, 0]
  },
})
