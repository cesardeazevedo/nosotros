import type { RepostDB } from '@/nostr/types'
import type { ObservableSet } from 'mobx'
import { makeAutoObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { Repost } from './repost'
import type { Note } from '../notes/note'

export const repostStore = makeAutoObservable({
  data: new Map<string, Repost>(),
  byNotes: new Map<string, ObservableSet<string>>(),

  clear() {
    this.data.clear()
    this.byNotes.clear()
  },

  add(event: NostrEvent, metadata: RepostDB, inner: Note) {
    const found = this.data.get(event.id)
    if (!found) {
      const repost = new Repost(event, metadata, inner)
      this.data.set(event.id, repost)
      const acc = this.byNotes.get(inner.id)
      if (acc) {
        acc.add(event.id)
      } else {
        this.byNotes.set(inner.id, observable.set([event.id]))
      }
      return repost
    }
    return found
  },
})
