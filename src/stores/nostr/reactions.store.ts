import type { NostrEvent } from 'core/types'
import { makeAutoObservable, observable } from 'mobx'
import { isEventTag } from '@/nostr/helpers/parseTags'

type ReactionPubkeys = {
  [emoji: string]: string[]
}

type PubkeyReactions = {
  [pubkey: string]: string[]
}

export function fallbackEmoji(emoji?: string) {
  switch (emoji) {
    case '+':
      return '🤙'
    case '-':
      return '👎'
    default:
      if (emoji && emoji.indexOf(':') > -1) {
        return '🤙'
      }
      return emoji
  }
}

export class ReactionStore {
  reactions = observable.map<string, ReactionPubkeys>({}, { deep: true })
  reactionsByPubkey = observable.map<string, PubkeyReactions>({}, { deep: true })

  constructor() {
    makeAutoObservable(this)
  }

  clear() {
    this.reactions.clear()
    this.reactionsByPubkey.clear()
  }

  getByNoteId(noteId: string) {
    return this.reactions.get(noteId)
  }

  getByNoteIdAndPubkey(noteId: string, pubkey?: string) {
    if (pubkey) {
      return this.reactionsByPubkey.get(noteId)?.[pubkey]
    }
  }

  sorted(noteId: string) {
    const reactions = this.getByNoteId(noteId)
    return Object.entries(reactions || {})
      .sort((a, b) => b[1].length - a[1].length)
      .filter((x) => x[0].length !== 0) // ignore empty emojis
  }

  getTotal(noteId: string) {
    return Object.values(this.getByNoteId(noteId) || {}).flat().length || 0
  }

  add(event: NostrEvent) {
    const emoji = fallbackEmoji(event.content) as string
    const tag = event.tags.findLast(isEventTag)

    if (tag) {
      const noteId = tag[1]

      // Append reactions by emoji
      const reactionsForNote = this.reactions.get(noteId) || {}
      reactionsForNote[emoji] ??= []
      if (reactionsForNote[emoji].indexOf(event.pubkey) === -1) {
        reactionsForNote[emoji].push(event.pubkey)
      }

      // Append reactions by pubkey
      const pubkeysForNote = this.reactionsByPubkey.get(noteId) || {}
      pubkeysForNote[event.pubkey] ??= []
      if (pubkeysForNote[event.pubkey].indexOf(emoji) === -1) {
        pubkeysForNote[event.pubkey].push(emoji)
      }

      this.reactionsByPubkey.set(noteId, pubkeysForNote)
      this.reactions.set(noteId, reactionsForNote)
    }
  }
}

export const reactionStore = new ReactionStore()
