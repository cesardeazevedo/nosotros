import type { Kind } from 'constants/kinds'
import type { SubscriptionOptions } from 'core/NostrSubscription'
import type { NostrFilter } from 'core/types'
import { makeAutoObservable, observable } from 'mobx'
import type { NostrClient } from 'nostr/nostr'
import { appState } from 'stores/app.state'
import Note from 'stores/models/note'
import { noteStore } from 'stores/nostr/notes.store'
import type { ModuleInterface } from './interface'

export type NoteOptions = {
  id: string
  type: 'note'
  subscription: SubscriptionOptions
}

export class NoteModule implements ModuleInterface {
  id: string

  client: NostrClient

  data = observable.box<Note>(undefined, { deep: false })

  options: NoteOptions

  filter: NostrFilter

  constructor(options: { id: string; kind?: Kind; relays?: string[] }) {
    makeAutoObservable(this)

    this.id = options.id || Math.random().toString().slice(2, 10)

    this.options = {
      id: this.id,
      type: 'note',
      subscription: {
        relayHints: {
          ids: {
            [this.id]: options.relays || [],
          },
        },
      },
    }

    this.client = appState.client

    this.filter = { ids: [this.options.id] }
  }

  get note() {
    return this.data.get()
  }

  start() {
    this.client.notes.subWithRelated(this.filter, this.options.subscription).subscribe(() => {
      this.handleNote()
    })
    this.handleNote()
  }

  stop() {
    const note = this.data.get()
    note?.toggleReplies(false)
  }

  handleNote() {
    const event = noteStore.get(this.id)?.data
    if (event) {
      // Create a new note model for each note module
      const note = new Note(event, this.client)
      this.data.set(note)
      note.toggleReplies(true)
    }
  }
}
