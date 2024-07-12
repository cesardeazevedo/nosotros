import { Node } from '@tiptap/core'

export interface NoteExtensionAttributes {
  id: string
  author: string
  relays: string[]
}

export const NoteExtension = Node.create({
  name: 'note',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      id: { default: null },
      author: { default: null },
      relays: { default: null },
    }
  },

  renderHTML() {
    return ['div', {}, 0]
  },
})
