import { action, makeObservable, observable } from 'mobx'
import type { User } from './user'

class UserStore {
  users = observable.map<string, User>({}, { name: 'users', deep: false })

  constructor() {
    makeObservable(this, { add: action }, { deep: false })
  }

  clear() {
    this.users.clear()
  }

  get(pubkey?: string) {
    if (pubkey) {
      return this.users.get(pubkey)
    }
    return undefined
  }

  add(user: User) {
    if (!this.users.has(user.pubkey)) {
      this.users.set(user.pubkey, user)
    }
  }
}

export const userStore = new UserStore()
