import { action, makeObservable, observable } from 'mobx'
import type { UserDB } from 'nostr/types'
import User from '../models/user'

class UserStore {
  users = observable.map<string, User>({}, { name: 'users', deep: false })

  constructor() {
    makeObservable(this, { add: action }, { deep: false })
  }

  get(pubkey?: string) {
    if (pubkey) {
      return this.users.get(pubkey)
    }
  }

  add(event: UserDB) {
    if (!this.users.has(event.pubkey)) {
      this.users.set(event.pubkey, new User(event))
    }
  }
}

export const userStore = new UserStore()
