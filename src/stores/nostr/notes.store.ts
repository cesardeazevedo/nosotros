import { dedupe } from 'core/helpers'
import { action, makeObservable, observable } from 'mobx'
import type { NoteDB } from 'nostr/types'
import type Note from '../models/note'

export class NoteStore {
  notes = observable.map<string, Note>({}, { name: 'notes', deep: false, proxy: false })
  replies = observable.map<string, string[]>({}, { name: 'replies', deep: false, proxy: false })

  constructor() {
    makeObservable(this, { add: action, addReply: action })
  }

  get(id: string) {
    return this.notes.get(id)
  }

  add(note: Note) {
    if (!this.notes.has(note.id)) {
      this.notes.set(note.id, note)
      if (!note.meta.isRoot) {
        this.addReply(note.data)
      }
    }
  }

  addReply(event: NoteDB) {
    const parentId = event.metadata.parentNoteId
    if (parentId) {
      this.replies.set(parentId, dedupe(this.replies.get(parentId), [event.id]))
    }
  }
}

export const noteStore = new NoteStore()
