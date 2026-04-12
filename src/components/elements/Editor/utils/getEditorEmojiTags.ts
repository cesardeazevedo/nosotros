import type { Editor as TiptapEditor } from '@tiptap/react'
import type { NostrEvent } from 'nostr-tools'

export function getEditorEmojiTags(editor: TiptapEditor | null | undefined): NostrEvent['tags'] {
  const emojiTags: NostrEvent['tags'] = []

  editor?.state.doc.descendants((node) => {
    if (node.type.name === 'emoji' && node.attrs.name && node.attrs.src) {
      if (!emojiTags.some((tag) => tag[0] === 'emoji' && tag[1] === node.attrs.name)) {
        emojiTags.push(['emoji', node.attrs.name, node.attrs.src])
      }
    }
  })

  return emojiTags
}
