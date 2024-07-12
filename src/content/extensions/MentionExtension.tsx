import { Node } from '@tiptap/core'

export type MentionExtensionAttributes = {
  id: string
  pubkey: string
}

export const MentionExtension = Node.create({
  name: 'mention',

  inline: true,

  inclusive: true,

  group: 'inline',

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
