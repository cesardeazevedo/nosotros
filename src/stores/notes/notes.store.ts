import type { NoteMetadataDB } from '@/nostr/types'
import { dedupe } from 'core/helpers'
import { action, makeObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { Note } from './note'

export class NoteStore {
  notes = observable.map<string, Note>({}, { name: 'notes', deep: false })
  replies = observable.map<string, string[]>({}, { name: 'replies' })
  addresses = new Map<string, string>()

  constructor() {
    makeObservable(this, { add: action, addReply: action })
  }

  clear() {
    this.notes.clear()
    this.replies.clear()
  }

  get(id?: string) {
    return this.notes.get(id || '')
  }

  add(event: NostrEvent, metadata: NoteMetadataDB) {
    const found = this.notes.get(event.id)
    if (!found) {
      const note = new Note(event, metadata)
      this.notes.set(note.id, note)
      this.addAddress(note)
      if (!note.metadata.isRoot) {
        this.addReply(note)
      }
      return note
    }
    return found
  }

  addAddress(note: Note) {
    this.addresses.set(`${note.event.kind}:${note.event.pubkey}:${note.metadata.tags.dtags}`, note.id)
  }

  addReply(note: Note) {
    const parentId = note.metadata.parentNoteId
    if (parentId) {
      this.replies.set(parentId, dedupe(this.replies.get(parentId), [note.id]))
    }
  }
}

export const noteStore = new NoteStore()
