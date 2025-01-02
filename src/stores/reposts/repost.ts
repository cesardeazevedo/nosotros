import type { RepostDB } from '@/nostr/types'
import type { NostrEvent } from 'nostr-tools'
import type { Note } from '../notes/note'

export class Repost {
  constructor(
    public event: NostrEvent,
    public meta: RepostDB,
    public note: Note,
  ) {}

  get id() {
    return this.event.id
  }

  // subscribe(...args: Parameters<Note['subscribe']>) {
  //   return this.note.subscribe(...args)
  // }
}
