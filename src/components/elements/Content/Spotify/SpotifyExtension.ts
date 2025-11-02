import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

export interface SpotifyOptions {
  inline: boolean
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    spotify: {
      insertSpotify: (options: { src: string }) => ReturnType
    }
  }
}

export const SpotifyExtension = Node.create<SpotifyOptions>({
  name: 'spotify',

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-spotify-embed]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-spotify-embed': '', ...HTMLAttributes }]
  },

  addCommands() {
    return {
      insertSpotify:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})