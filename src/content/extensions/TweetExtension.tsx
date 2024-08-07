import { Node } from '@tiptap/core'

export const TweetExtension = Node.create({
  name: 'tweet',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    }
  },

  // addNodeView() {
  //   return ReactNodeViewRenderer(TweetEditor)
  // },

  renderHTML() {
    return ['div', {}, 0]
  },
})
