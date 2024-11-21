import { dedupe } from 'core/helpers'
import { action, makeObservable, observable } from 'mobx'
import type { Note } from '../models/note'

export class NoteStore {
  notes = observable.map<string, Note>({}, { name: 'notes', deep: false })
  replies = observable.map<string, string[]>({}, { name: 'replies' })
  addresses = new Map<string, string>()

  constructor() {
    makeObservable<NoteStore, 'addReply'>(this, { add: action, addReply: action })
  }

  clear() {
    this.notes.clear()
    this.replies.clear()
  }

  get(id?: string) {
    return this.notes.get(id || '')
  }

  add(note: Note) {
    if (!this.notes.has(note.id)) {
      this.notes.set(note.id, note)
      this.addAddress(note)
      if (!note.meta.isRoot) {
        this.addReply(note)
      }
    }
  }

  private addAddress(note: Note) {
    this.addresses.set(`${note.event.kind}:${note.event.pubkey}:${note.meta.tags.dtags}`, note.id)
  }

  private addReply(note: Note) {
    const parentId = note.metadata.parentNoteId
    if (parentId) {
      this.replies.set(parentId, dedupe(this.replies.get(parentId), [note.id]))
    }
  }
}

export const noteStore = new NoteStore()
