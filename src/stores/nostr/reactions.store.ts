import { makeAutoObservable, observable } from 'mobx'
import { Event } from 'nostr-tools'
import { isEventTag } from 'utils/utils'
import type { RootStore } from '../root.store'

type Reactions = {
  [emoji: string]: string[]
}

const fallbackEmojis: Record<string, string> = {
  '+': '🤙',
  '-': '👎',
  '⚡': '⚡',
}

export class ReactionStore {
  reactions = observable.map<string, Reactions>()

  constructor(private root: RootStore) {
    makeAutoObservable(this)
  }

  getReactionByNoteId(noteId: string) {
    return this.reactions.get(noteId)
  }

  getTopReactions(noteId: string) {
    // We might want to return the top 3 reactions in the future
    const reactions = this.getReactionByNoteId(noteId)
    return Object.entries(reactions || {})
      .sort((a, b) => b[1].length - a[1].length)
      .filter((x) => x[0].length !== 0) // ignore empty emojis
  }

  getTotal(noteId: string | undefined) {
    return noteId ? Object.values(this.getReactionByNoteId(noteId) || {}).flat().length : 0
  }

  add(event: Event) {
    const emoji = fallbackEmojis[event.content] || event.content

    event.tags.forEach((tag) => {
      if (isEventTag(tag)) {
        const noteId = tag[1]

        const reactionsForNote = this.reactions.get(noteId) || {}
        const reactionsForEmoji = reactionsForNote[emoji] || []

        if (reactionsForEmoji.indexOf(event.pubkey) === -1) {
          reactionsForEmoji.push(event.pubkey)
        }

        reactionsForNote[emoji] = reactionsForEmoji

        this.reactions.set(noteId, reactionsForNote)
      }
    })
  }
}
