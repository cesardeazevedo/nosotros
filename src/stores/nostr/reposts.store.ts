import type { ObservableSet } from 'mobx'
import { makeAutoObservable, observable } from 'mobx'
import type { Repost } from '../models/repost'

class RepostStore {
  data = observable.map<string, Repost>()
  reposts = observable.map<string, ObservableSet<string>>()

  constructor() {
    makeAutoObservable(this)
  }

  clear() {
    this.data.clear()
  }

  add(repost: Repost) {
    this.data.set(repost.event.id, repost)
    const exists = this.reposts.get(repost.meta.id)
    if (exists) {
      exists.add(repost.event.id)
    }
    this.reposts.set(repost.meta.id, observable.set([repost.event.id]))
  }
}

export const repostStore = new RepostStore()
