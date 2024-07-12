import type { NostrEvent } from "core/types"
import { makeAutoObservable, observable } from "mobx"
import { isEventTag } from "nostr/nips/nip01/metadata/parseTags"
import { authStore } from "stores/ui/auth.store"

export type Reactions = {
  [emoji: string]: string[]
}

export function fallbackEmoji(emoji: string) {
  switch (emoji) {
    case '+':
      return '🤙'
    case '-':
      return '👎'
    default:
      return emoji
  }
}

export class ReactionStore {
  reactions = observable.map<string, Reactions>({}, { deep: true })
  myReactions = observable.map<string, string[]>({}, { deep: true })

  constructor() {
    makeAutoObservable(this)
  }

  getByNoteId(noteId: string) {
    return this.reactions.get(noteId)
  }

  getTopReactions(noteId: string) {
    // We might want to return the top 3 reactions in the future
    const reactions = this.getByNoteId(noteId)
    return Object.entries(reactions || {})
      .sort((a, b) => b[1].length - a[1].length)
      .filter((x) => x[0].length !== 0) // ignore empty emojis
  }

  getTotal(noteId: string) {
    return Object.values(this.getByNoteId(noteId) || {}).flat().length || 0
  }

  add(event: NostrEvent) {
    const emoji = fallbackEmoji(event.content)

    event.tags.forEach((tag) => {
      if (isEventTag(tag)) {
        const noteId = tag[1]

        const reactionsForNote = this.reactions.get(noteId) || {}
        const reactionsForEmoji = reactionsForNote[emoji] || []

        if (reactionsForEmoji.indexOf(event.pubkey) === -1) {
          reactionsForEmoji.push(event.pubkey)
        }

        reactionsForNote[emoji] = reactionsForEmoji
        if (event.pubkey === authStore.pubkey) {
          const myReactionsForNote = this.myReactions.get(noteId) || []
          this.myReactions.set(noteId, [...myReactionsForNote, event.content])
        }

        this.reactions.set(noteId, reactionsForNote)
      }
    })
  }
}

export const reactionStore = new ReactionStore()
