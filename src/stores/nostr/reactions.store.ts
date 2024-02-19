import { Kind } from 'constants/kinds'
import { makeAutoObservable, observable } from 'mobx'
import type { Event } from 'nostr-tools'
import { Filter } from 'stores/core/filter'
import { bufferTime } from 'stores/core/operators'
import type { Note } from 'stores/modules/note.store'
import { dedupe, isEventTag } from 'utils/utils'
import type { RootStore } from '../root.store'

type Reactions = {
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
  reactions = observable.map<string, Reactions>()
  myReactions = observable.map<string, string[]>()

  constructor(private root: RootStore) {
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

  getTotal(noteId: string | undefined) {
    return noteId ? Object.values(this.getByNoteId(noteId) || {}).flat().length : 0
  }

  add(event: Event) {
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
        if (event.pubkey === this.root.auth.pubkey) {
          const myReactionsForNote = this.myReactions.get(noteId) || []
          this.myReactions.set(noteId, [...myReactionsForNote, event.content])
        }

        this.reactions.set(noteId, reactionsForNote)
      }
    })
  }

  async react(note: Note, emoji: string) {
    let pubkey = this.root.auth.pubkey
    if (!pubkey) {
      await this.root.auth.loginWithNostrExtension()
      if (this.root.auth.pubkey) {
        pubkey = this.root.auth.pubkey
      }
    }
    if (pubkey) {
      const unsigned = {
        kind: Kind.Reaction,
        pubkey,
        created_at: parseInt((Date.now() / 1000).toString()),
        content: emoji,
        tags: [
          ['e', note.id],
          ['p', note.event.pubkey],
        ],
      }
      const myRelays = await this.root.userRelays.fetchRelaysFromAuthor(pubkey, true)
      const authorRelays = await this.root.userRelays.fetchRelaysFromAuthor(note.event.pubkey, true)
      const relays = dedupe(myRelays, authorRelays)
      this.root.nostr.publish(unsigned, relays)
    }
  }

  subscribe(noteIds: string[]) {
    const sub = this.root.nostr.subscribe(
      new Filter(this.root, {
        kinds: [Kind.Reaction],
        '#e': noteIds,
      }),
    )
    sub.onEvent$.pipe(bufferTime(2000)).subscribe((events) => {
      events.forEach((event) => {
        this.root.reactions.add(event)
      })
    })
    return sub
  }
}
