import { dedupe } from 'core/helpers'
import type { SeenDB } from 'db/types'
import { makeAutoObservable, observable } from 'mobx'

class SeenStore {
  seen = observable.map<string, string[]>()

  constructor() {
    makeAutoObservable(this)
  }

  get(eventId?: string) {
    if (eventId) {
      return this.seen.get(eventId) || []
    }
    return []
  }

  add(seen: SeenDB) {
    this.seen.set(seen.eventId, dedupe(this.seen.get(seen.eventId) || [], [seen.relay]))
  }
}

export const seenStore = new SeenStore()
