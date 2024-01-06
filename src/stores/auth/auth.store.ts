import { makeAutoObservable, runInAction } from 'mobx'
import { makePersistable } from 'mobx-persist-store'
import { Event, UnsignedEvent } from 'nostr-tools'
import type { RootStore } from '../root.store'

export type NostrExtension = {
  getPublicKey(): Promise<string>
  signEvent(event: UnsignedEvent): Promise<Event>
}

// To be defined
type Credential = unknown

export class AuthStore {
  /**
   * All accounts
   */
  accounts = new Map<string, Credential>()

  /**
   * Current selected account
   */
  pubkey?: string

  hasExtension?: boolean

  constructor(private root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })

    // Browser extension takes some time to load
    setTimeout(() => {
      runInAction(() => {
        this.hasExtension = 'nostr' in window
      })
    }, 2000)

    makePersistable(this, { name: 'auth', properties: ['pubkey', 'accounts'], storage: window.localStorage })?.then(
      () => {
        if (this.pubkey && typeof this.pubkey !== 'string') {
          this.pubkey = undefined
        }
      },
    )
  }

  get currentUser() {
    return this.pubkey ? this.root.users.users.get(this.pubkey) : undefined
  }

  addAccount(pubkey: string) {
    this.pubkey = pubkey
    this.accounts.set(pubkey, {})
    this.root.deck.reset()
    this.root.initializeFeed()
    this.root.dialogs.closeAuth()
  }

  async fetchUser(pubkey: string) {
    const sub = this.root.users.subscribe([pubkey])
    sub.onEvent$.subscribe()
  }

  async loginWithNostrExtension() {
    if ('nostr' in window) {
      const nostr = window.nostr as NostrExtension
      const pubkey = await nostr.getPublicKey()
      this.addAccount(pubkey)
    }
  }

  logout() {
    this.accounts.delete(this.pubkey || '')
    this.pubkey = undefined
    this.root.deck.reset()
    this.root.initializeFeed()
  }
}
