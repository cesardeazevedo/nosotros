import type { UserMetadata } from '@/nostr/types'
import { action, makeObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { User } from './user'

export class UserStore {
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
    const user = new User(event, metadata)
    this.users.set(user.pubkey, user)
    return user
  }
}

export const userStore = new UserStore()
