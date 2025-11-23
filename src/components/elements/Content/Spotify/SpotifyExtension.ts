import { Node, nodePasteRule } from '@tiptap/core'

export interface SpotifyOptions {
  inline: boolean
  HTMLAttributes: Record<string, unknown>
}

const SPOTIFY_REGEX_GLOBAL =
  /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)(?:\?[^\s]*)?/g

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

  renderText(props) {
    return props.node.attrs.src
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-spotify-embed': '', ...HTMLAttributes }]
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: SPOTIFY_REGEX_GLOBAL,
        type: this.type,
        getAttributes: (match) => {
          const type = match[1]
          const id = match[2]
          return { src: `https://open.spotify.com/embed/${type}/${id}` }
        },
      }),
    ]
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

