import type { UserMetadata } from '@/nostr/types'
import { action, makeObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { User } from './user'

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

  add(event: NostrEvent, metadata: UserMetadata) {
    const found = this.users.get(event.pubkey)
    if (!found) {
      const user = new User(event, metadata)
      this.users.set(user.pubkey, user)
      return user
    }
    return found
  }
}

export const userStore = new UserStore()
