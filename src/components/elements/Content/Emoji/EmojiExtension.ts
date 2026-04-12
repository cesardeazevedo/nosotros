import type { OnKeyDownRef } from '@/components/modules/Search/SearchContent'
import { ReactRenderer } from '@tiptap/react'
import { Node, nodeInputRule } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import type { ComponentProps, KeyboardEvent } from 'react'
import { EmojiSuggestion, type EmojiSuggestionItem } from './EmojiSuggestion'

export interface EmojiOptions {
  resolveEmoji: (name: string) => { name: string; src: string } | null
  getEmojiSuggestions: (query: string) => EmojiSuggestionItem[]
}

const EMOJI_REGEX_INPUT = /:([\w-]+):$/
const EMOJI_REGEX_PASTE = /:([\w-]+):/g
const EMOJI_PASTE_META = 'emojiPasteTransform'
const EMOJI_SUGGESTION_KEY = new PluginKey('emojiSuggestion')
export const EmojiExtension = Node.create<EmojiOptions>({
  name: 'emoji',

  addOptions() {
    return {
      resolveEmoji: () => null,
      getEmojiSuggestions: () => [],
    }
  },

  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      name: {
        default: null,
      },
      src: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[data-emoji-inline]',
      },
    ]
  },

  renderText({ node }) {
    return `:${node.attrs.name || 'emoji'}:`
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'img',
      {
        ...HTMLAttributes,
        'data-emoji-inline': '',
        src: node.attrs.src,
        alt: `:${node.attrs.name || 'emoji'}:`,
        draggable: 'false',
        contenteditable: 'false',
        style: 'display:inline-block;width:1.2em;height:1.2em;vertical-align:text-bottom;object-fit:contain;',
      },
    ]
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: EMOJI_REGEX_INPUT,
        type: this.type,
        getAttributes: (match) => {
          const resolved = this.options.resolveEmoji(match[1])
          return resolved ? { name: resolved.name, src: resolved.src } : false
        },
      }),
    ]
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        char: ':',
        pluginKey: EMOJI_SUGGESTION_KEY,
        editor: this.editor,
        allowSpaces: false,
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from)
          return !$from.parent.type.spec.code
        },
        items: ({ query }) => this.options.getEmojiSuggestions(query),
        command: ({ editor, range, props }) => {
          const emoji = props as EmojiSuggestionItem
          const emojiNode = editor.schema.nodes.emoji?.create({
            name: emoji.name,
            src: emoji.src,
          })
          if (!emojiNode) {
            return
          }
          editor.chain().focus().insertContentAt(range, emojiNode).run()
          window.getSelection()?.collapseToEnd()
        },
        render() {
          let component: ReactRenderer<OnKeyDownRef, ComponentProps<typeof EmojiSuggestion>>
          return {
            onStart(props) {
              component = new ReactRenderer(EmojiSuggestion, {
                props,
                editor: props.editor,
              })
            },
            onUpdate(props) {
              component.updateProps(props)
            },
            onExit() {
              component.destroy()
            },
            onKeyDown(props) {
              return (
                component.ref?.onKeyDown?.({
                  event: props.event as unknown as KeyboardEvent<HTMLInputElement>,
                }) || false
              )
            },
          }
        },
      }),
      new Plugin({
        key: new PluginKey('emojiPastePlugin'),
        appendTransaction: (transactions, oldState, state) => {
          if (
            !transactions.some((transaction) => transaction.getMeta('uiEvent') === 'paste') ||
            transactions.some((transaction) => transaction.getMeta(EMOJI_PASTE_META))
          ) {
            return
          }

          const from = oldState.doc.content.findDiffStart(state.doc.content)
          const to = oldState.doc.content.findDiffEnd(state.doc.content)

          if (typeof from !== 'number' || !to || from === to.b) {
            return
          }

          const replacements: Array<{ from: number; to: number; attrs: { name: string; src: string } }> = []

          state.doc.nodesBetween(Math.max(from - 1, 0), to.b, (node, pos) => {
            if (!node.isTextblock || node.type.spec.code) {
              return
            }

            const resolvedFrom = Math.max(from, pos)
            const resolvedTo = Math.min(to.b, pos + node.content.size)
            const textToMatch = node.textBetween(resolvedFrom - pos, resolvedTo - pos, undefined, '\ufffc')

            for (const match of textToMatch.matchAll(EMOJI_REGEX_PASTE)) {
              const index = match.index
              const name = match[1]
              if (index === undefined || !name) {
                continue
              }

              const resolved = this.options.resolveEmoji(name)
              if (!resolved) {
                continue
              }

              const start = resolvedFrom + index + 1
              const end = start + match[0].length
              replacements.push({
                from: start,
                to: end,
                attrs: {
                  name: resolved.name,
                  src: resolved.src,
                },
              })
            }
          })

          if (replacements.length === 0) {
            return
          }

          const tr = state.tr
          const emojiNodeType = state.schema.nodes.emoji

          for (const replacement of [...replacements].reverse()) {
            const emojiNode = emojiNodeType?.create(replacement.attrs)
            if (!emojiNode) {
              continue
            }
            tr.replaceWith(replacement.from, replacement.to, emojiNode)
          }

          if (!tr.steps.length) {
            return
          }

          tr.setMeta(EMOJI_PASTE_META, true)
          return tr
        },
      }),
    ]
  },
})
