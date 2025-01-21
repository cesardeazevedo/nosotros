import type { NoteMetadata } from '@/nostr/types'
import { dedupe } from 'core/helpers/dedupe'
import { action, makeObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'
import { Note } from './note'

export class NoteStore {
  notes = observable.map<string, Note>()
  replies = observable.map<string, string[]>()
  addresses = observable.map<string, string[]>()

  constructor() {
    makeObservable(this, { add: action, addReply: action })
  }

  clear() {
    this.notes.clear()
    this.replies.clear()
    this.addresses.clear()
  }

  get(id?: string) {
    return this.notes.get(id || '')
  }

  getReplies(note: Note) {
    if (isParameterizedReplaceableKind(note.event.kind) && note.d) {
      return [...(this.replies.get(note.id) || []), ...(this.addresses.get(note.address) || [])]
    } else {
      return this.replies.get(note.id)
    }
  }

  add(event: NostrEvent, metadata: NoteMetadata) {
    const found = this.notes.get(event.id)
    if (!found) {
      const note = new Note(event, metadata)
      this.notes.set(note.id, note)
      if (!note.metadata.isRoot) {
        this.addReply(note)
      }
      return note
    }
    return found
  }

  addReply(note: Note) {
    const parentId = note.metadata.parentId
    if (parentId) {
      const isAddressable = parentId.includes(':')
      if (isAddressable) {
        this.addresses.set(parentId, dedupe(this.addresses.get(parentId), [note.id]))
      } else {
        this.replies.set(parentId, dedupe(this.replies.get(parentId), [note.id]))
      }
    }
  }
}

export const noteStore = new NoteStore()
