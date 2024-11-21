import type { NostrClientOptions } from '@/nostr/nostr'
import { NostrClient } from '@/nostr/nostr'
import { pool } from '@/nostr/pool'
import { makeAutoObservable } from 'mobx'
import { EMPTY, merge } from 'rxjs'
import { userStore } from '../nostr/users.store'

export class NostrContext {
  client: NostrClient

  constructor(options: NostrClientOptions) {
    this.client = new NostrClient(pool, options)

    makeAutoObservable(this)
  }

  get pubkey() {
    return this.client.pubkey
  }

  get signer() {
    return this.client.signer
  }

  get settings() {
    return this.client.settings
  }

  get isLogged() {
    return !!this.pubkey
  }

  get user() {
    return userStore.get(this.pubkey)
  }

  setClient(options: NostrClientOptions) {
    this.client = new NostrClient(pool, options)
  }

  subscribe() {
    const { pubkey } = this
    if (pubkey) {
      return merge(this.client.users.subscribe(pubkey), this.client.follows.subscribe(pubkey))
    }
    return EMPTY
  }
}
