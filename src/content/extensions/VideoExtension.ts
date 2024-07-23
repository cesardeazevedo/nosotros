import { Node } from '@tiptap/core'

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

  renderHTML() {
    return ['a', {}, 0]
  },
})
