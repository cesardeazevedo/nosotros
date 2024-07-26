import { Extension, combineTransactionSteps, getChangedRanges, type Editor, type Range } from '@tiptap/core'
import extractDomain from 'extract-domain'
import * as linkifyjs from 'linkifyjs'
import { parseReferences, type NostrReference } from 'nostr/nips/nip27.references'
import type { IMetaFields } from 'nostr/nips/nip92.imeta'
import { undoDepth } from 'prosemirror-history'
import type { Node } from 'prosemirror-model'
import { Plugin, PluginKey, type EditorState, type Transaction } from 'prosemirror-state'
import tlds from 'tlds'

interface MatchBase extends Range {
  text: string
}

interface MatchLinks extends MatchBase {
  kind: 'text' | 'image' | 'video' | 'tweet' | 'youtube'
  href: string
}

interface MatchTag extends MatchBase {
  kind: 'tag'
}

interface MatchNostr extends MatchBase {
  kind: 'nostr'
  ref: NostrReference
}

type Matches = MatchLinks | MatchNostr | MatchTag

interface GetMarkRange {
  from: number
  to: number
  text: string
}

interface NodeWithPosition {
  node: Node
  pos: number
}

const IMAGE_EXTENSIONS = /.(jpg|jpeg|gif|png|bmp|svg|webp)$/
const VIDEO_EXTENSIONS = /.(webm|mp4|ogg|mov)$/
const REGEX_TAG = /(#\w+)/g

type Storage = {
  imeta?: IMetaFields
}

export const AutoMatcherExtension = Extension.create<unknown, Storage>({
  name: 'autoMatcher',

  addProseMirrorPlugins() {
    return [new AutoMatcherPlugin(this.editor).plugin]
  },
})

class AutoMatcherPlugin {
  editor: Editor
  plugin: Plugin

  constructor(editor: Editor) {
    this.editor = editor

    const linkType = editor.schema.marks.link

    this.plugin = new Plugin({
      key: new PluginKey('link'),

      appendTransaction: (transactions, oldState, newState) => {
        const isUndo = undoDepth(oldState) - undoDepth(newState) === 1

        if (isUndo) {
          return
        }

        const docChanges = transactions.some((transaction) => transaction.docChanged)

        if (!docChanges) {
          return
        }

        const transform = combineTransactionSteps(oldState.doc, [...transactions])
        const changes = getChangedRanges(transform)

        const { tr, doc } = newState
        const { mapping } = transform

        changes.forEach(({ oldRange, newRange }) => {
          const { from, to } = newRange
          const isNodeSeparated = to - from === 2

          const prevMarks = this.getLinkMarksInRange(oldState.doc, oldRange.from, oldRange.to).map((mark) => ({
            mappedFrom: mapping.map(mark.from),
            mappedTo: mapping.map(mark.to),
            text: mark.text,
            from: mark.from,
            to: mark.to,
          }))

          prevMarks.forEach(({ mappedFrom: newFrom, mappedTo: newTo, from: prevMarkFrom, to: prevMarkTo }, i) => {
            this.getLinkMarksInRange(doc, newFrom, newTo).forEach((newMark) => {
              const prevLinkText = oldState.doc.textBetween(prevMarkFrom, prevMarkTo, undefined, ' ')
              const newLinkText = doc.textBetween(newMark.from, newMark.to + 1, undefined, ' ').trim()

              const wasLink = this.isValidTLD(prevLinkText)
              const isLink = this.isValidTLD(newLinkText)

              if (isLink) {
                return
              }

              if (wasLink) {
                tr.removeMark(newMark.from, newMark.to, linkType)
                prevMarks.splice(i, 1)
              }

              if (isNodeSeparated) {
                return
              }

              // Check newLinkText for a remaining valid link
              if (from === to) {
                this.findMatches(newLinkText, newFrom).forEach((match) => {
                  this.replace(tr, newState, match)
                })
              }
            })
          })

          const replacements = this.findTextBlocksInRange(doc, { from, to }).flatMap(({ text, positionStart }) => {
            return this.findMatches(text, positionStart + 1)
              .filter((range) => {
                const fromIsInRange = range.from >= from && range.from <= to
                const toIsInRange = range.to >= from && range.to <= to
                return fromIsInRange || toIsInRange || isNodeSeparated
              })
              .filter(({ from, text }) => !prevMarks.some((prev) => prev.mappedFrom === from && prev.text === text))
          })
          // Replace the nodes in reverse order not maintain the ranges correctly
          replacements
            .sort((a, b) => (a.to > b.to ? -1 : 1))
            // Remove intersecting nodes
            .reduce((acc, current) => {
              const prev = acc[acc.length - 1]
              if (current.to < (prev?.from || Infinity)) {
                return [...acc, current]
              }
              return acc
            }, [] as Matches[])
            .forEach((link) => this.replace(tr, newState, link))
        })

        if (tr.steps.length === 0) {
          return
        }

        return tr
      },

      props: {
        clipboardTextSerializer(slice) {
          let text = ''
          slice.content.descendants((node) => {
            if (node.type.name === 'paragraph') {
              return
            }
            text += node.textContent
            if (node.type.name === 'mention' || node.type.name === 'note') {
              text += node.attrs.text
            }
          })
          return text
        },
      },
    })
  }

  private replace(tr: Transaction, state: EditorState, match: Matches) {
    const { kind, text, from, to } = match
    const { nodes, marks } = state.schema
    switch (kind) {
      case 'text': {
        tr.addMark(from, to, marks.link.create({ href: match.href }))
        return true
      }
      case 'image': {
        tr.replaceWith(from, to, nodes.image.create({ src: match.href }))
        return true
      }
      case 'youtube': {
        tr.replaceWith(from, to, nodes.youtube.create({ src: match.href }))
        return true
      }
      case 'tweet': {
        tr.replaceWith(from, to, nodes.tweet.create({ src: match.href }))
        return true
      }
      case 'video': {
        tr.replaceWith(from, to, nodes.video.create({ src: match.href }))
        return true
      }
      case 'tag': {
        tr.addMark(from, to, marks.tag.create({ tag: match.text }))
        return true
      }
      case 'nostr': {
        const { ref } = match
        switch (ref.prefix) {
          case 'npub':
          case 'nprofile': {
            tr.replaceWith(from, to, nodes.mention.create({ ...ref.profile, text }))
            return true
          }
          case 'note':
          case 'nevent': {
            tr.replaceWith(from, to, nodes.note.create(ref.event))
            return true
          }
          default: {
            return false
          }
        }
      }
      default: {
        return false
      }
    }
  }

  private findTextBlocksInRange(node: Node, range: Range): Array<{ text: string; positionStart: number }> {
    const nodesWithPos: NodeWithPosition[] = []

    // define a placeholder for leaf nodes to calculate link position
    node.nodesBetween(range.from, range.to, (node, pos) => {
      if (!node.isTextblock || !node.type.allowsMarkType(this.editor.schema.marks.link)) {
        return
      }

      nodesWithPos.push({ node, pos })
    })

    return nodesWithPos.map((textBlock) => ({
      text: node.textBetween(textBlock.pos, textBlock.pos + textBlock.node.nodeSize, undefined, ' '),
      positionStart: textBlock.pos,
    }))
  }

  private findMatches(text: string, positionStart: number): Matches[] {
    const links = this.findLinks(text)
    const refs = this.findNostrRefs(text)
    const tags = this.findTags(text)
    const res = [...links, ...tags, ...refs].map((match) => ({
      ...match,
      from: positionStart + match.from,
      to: positionStart + match.to,
    }))
    return res
  }

  private findLinks(text: string): Matches[] {
    const links: Matches[] = []

    for (const { start: from, end: to, value, href } of linkifyjs.find(text) || []) {
      const kind = this.getLinkKind(value, href)

      if (!this.isValidTLD(href) && !href.startsWith('tel:')) {
        continue
      }

      links.push({ text: value, href, kind, from, to })
    }

    return links
  }

  private findTags(text: string): Matches[] {
    const tags: Matches[] = []
    for (const match of text.matchAll(REGEX_TAG)) {
      const text = match[0]
      const from = match.index || 0
      const to = from + text.length
      tags.push({ text: match[0], kind: 'tag', from, to })
    }
    return tags
  }

  private findNostrRefs(text: string): Matches[] {
    const refs: Matches[] = []
    const parsed = this.editor.storage.reference || parseReferences({ content: text })
    for (const ref of parsed) {
      const from = ref.index
      const to = from + ref.text.length
      refs.push({ kind: 'nostr', from, to, text: ref.text, ref })
    }
    return refs
  }

  private getLinkMarksInRange(doc: EditorState['doc'], from: number, to: number) {
    const linkMarks: GetMarkRange[] = []

    doc.nodesBetween(from, to, (node, pos) => {
      const marks = node.marks ?? []
      const mark = marks.find((mark) => mark.type === this.editor.schema.marks.link)

      if (mark) {
        linkMarks.push({
          from: pos,
          to: pos + node.nodeSize,
          text: node.textContent,
        })
      }
    })
    return linkMarks
  }

  private getLinkKind(url: string, href: string): MatchLinks['kind'] {
    const mimetype = this.editor.storage.imeta?.[url]?.m?.split?.('/')?.[0]
    if (mimetype && ['image', 'video'].includes(mimetype)) {
      return mimetype as 'image' | 'video'
    } else if (/youtube|youtu.be/.test(url)) {
      return 'youtube'
    } else if (/^https?:\/\/(twitter|x)\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/.test(url)) {
      return 'tweet'
    } else {
      try {
        const { pathname } = new URL(href)
        return IMAGE_EXTENSIONS.test(pathname) ? 'image' : VIDEO_EXTENSIONS.test(pathname) ? 'video' : 'text'
      } catch (error) {
        console.log('url parser error', error)
        return 'text'
      }
    }
  }

  private isValidTLD(str: string): boolean {
    const domain = extractDomain(str)

    if (domain === '') {
      // Not a domain
      return true
    }

    const parts = domain?.toString().split('.') || []
    const tld = parts[parts.length - 1]

    return tlds.includes(tld)
  }
}
