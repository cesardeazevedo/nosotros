import { isEventTag } from '@/nostr/helpers/parseTags'
import type { NostrEvent } from 'core/types'
import { makeAutoObservable, observable } from 'mobx'

type ReactionPubkeys = {
  [reaction: string]: string[]
}

export function fallbackEmoji(reaction?: string) {
  switch (reaction) {
    case '+':
      return '🤙'
    case '-':
      return '👎'
    default:
      if (reaction && reaction.indexOf(':') > -1) {
        return '🤙'
      }
      return reaction
  }
}

export class ReactionStore {
  reactions = observable.map<string, NostrEvent>({}, { deep: false })
  reactionsByEvent = observable.map<string, ReactionPubkeys>({}, { deep: true })
  reactionsByPubkey = observable.map<string, { [id: string]: string[] }>({}, { deep: true })
  reactionsCount = observable.map<string, number>()

  constructor() {
    makeAutoObservable(this)
  }

  clear() {
    this.reactionsByEvent.clear()
    this.reactionsByPubkey.clear()
  }

  get(id: string) {
    return this.reactions.get(id)
  }

  getByNoteId(noteId: string) {
    return this.reactionsByEvent.get(noteId)
  }

  getByPubkey(noteId?: string) {
    return this.reactionsByPubkey.get(noteId || '')
  }

  sorted(noteId: string) {
    const reactions = this.getByNoteId(noteId)
    return Object.entries(reactions || {})
      .sort((a, b) => b[1].length - a[1].length)
      .filter((x) => x[0].length !== 0) // ignore empty emojis
  }

  getTotal(noteId: string) {
    const total = Object.values(this.getByNoteId(noteId) || {}).flat().length || 0
    const totalCount = this.reactionsCount.get(noteId) || 0
    return total + totalCount
  }

  add(event: NostrEvent) {
    const reaction = fallbackEmoji(event.content) as string
    const tag = event.tags.findLast(isEventTag)
    const found = this.get(event.id)
    if (!found) {
      this.reactions.set(event.id, event)

      if (tag) {
        const noteId = tag[1]

        // Append reactions by emoji
        const reactionsForNote = this.reactionsByEvent.get(noteId) || {}
        reactionsForNote[reaction] ??= []
        if (reactionsForNote[reaction].indexOf(event.pubkey) === -1) {
          reactionsForNote[reaction].push(event.pubkey)
        }
        this.reactionsByEvent.set(noteId, reactionsForNote)

        // Append reactions by pubkey
        const byPubkey = this.reactionsByPubkey.get(event.pubkey)
        if (byPubkey) {
          byPubkey[noteId] ??= []
          if (byPubkey[noteId]?.indexOf(reaction) === -1) {
            byPubkey[noteId]?.push(reaction)
          }
        } else {
          this.reactionsByPubkey.set(event.pubkey, { [noteId]: [event.content] })
        }
      }
      return event
    }
    return found
  }

  addCount(id: string, count: number) {
    this.reactionsCount.set(id, count)
  }
}

export const reactionStore = new ReactionStore()
