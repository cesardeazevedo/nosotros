import type { RepostDB } from '@/nostr/types'
import { makeAutoObservable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import type { Note } from './note'

export class Repost {
  constructor(
    public event: NostrEvent,
    public meta: RepostDB,
    public note: Note,
  ) {
    makeAutoObservable(this, { event: false })
  }

  get id() {
    return this.event.id
  }
}
