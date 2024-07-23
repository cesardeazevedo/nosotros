import { action, makeObservable, observable } from 'mobx'
import type Follows from '../models/follow'

class FollowsStore {
  follows = observable.map<string, Follows>({}, { name: 'users', deep: false, proxy: true })

  constructor() {
    makeObservable(this, { add: action })
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
