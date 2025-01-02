import { dedupe } from 'core/helpers'
import type { SeenDB } from 'db/types'
import { makeAutoObservable } from 'mobx'

export const seenStore = makeAutoObservable({
  seen: new Map<string, string[]>(),

  get(eventId?: string) {
    if (eventId) {
      return this.seen.get(eventId) || []
    }
    return []
  },

  add(seen: SeenDB) {
    this.seen.set(seen.eventId, dedupe(this.seen.get(seen.eventId) || [], [seen.relay]))
  },
})
