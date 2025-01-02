import { action, makeObservable, observable } from 'mobx'
import type { Follows } from './follow'

class FollowsStore {
  follows = observable.map<string, Follows>({}, { name: 'users' })

  constructor() {
    makeObservable(this, { add: action })
  }

  clear() {
    this.follows.clear()
  }

  get(pubkey: string) {
    return this.follows.get(pubkey)
  }

  add(data: Follows) {
    if (!this.follows.has(data.pubkey)) {
      this.follows.set(data.pubkey, data)
    }
  }
}

export const followsStore = new FollowsStore()
