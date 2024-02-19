import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { MentionEditor } from './MentionEditor'

export type MentionExtensionAttributes = {
  id: string
  pubkey: string
}

export const MentionExtension = Node.create({
  name: 'mention',

  inline: true,

  inclusive: true,

  group: 'inline',

  addNodeView() {
    return ReactNodeViewRenderer(MentionEditor)
  },

  renderHTML(p) {
    return ['span', { ...p.node.attrs }, 'mention']
  },

  addAttributes() {
    return {
      text: { default: null },
      pubkey: { default: null },
      relays: { default: null },
    }
  },
})
