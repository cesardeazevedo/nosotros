import { Mark } from '@tiptap/core'

export interface LinkProtocolOptions {
  scheme: string
  optionalSlashes?: boolean
}

export type LinkAttributes = {
  href: string
}

export const LinkExtension = Mark.create({
  name: 'link' as const,

  inclusive: false,

  excludes: '_',

  addAttributes() {
    return {
      href: { default: null },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['a', HTMLAttributes, 0]
  },
})
