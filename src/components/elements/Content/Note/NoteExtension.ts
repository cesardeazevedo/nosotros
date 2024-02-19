import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import NoteEditor from './NoteEditor'

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

  addNodeView() {
    return ReactNodeViewRenderer(NoteEditor)
  },

  renderHTML() {
    return ['div', {}, 0]
  },
})
