import type { ObservableSet } from 'mobx'
import { autorun, makeAutoObservable, observable, reaction, runInAction } from 'mobx'
import { getNostrExtension, getNostrExtensionPublicKey } from 'nostr/nips/nip07.extensions'
import { userStore } from 'stores/nostr/users.store'

const item = localStorage.getItem('auth')
const data = item ? (JSON.parse(item || '{}') as { accounts: string[]; pubkey: string }) : undefined

export class AuthStore {
  accounts: ObservableSet<string>
  pubkey: string | undefined
  hasExtension?: boolean

  constructor() {
    makeAutoObservable(this, { accounts: false })

    this.accounts = observable.set(data?.accounts)
    this.pubkey = data?.pubkey

    autorun(() => {
      const data = {
        pubkey: this.pubkey,
        accounts: Array.from(this.accounts),
      }
      localStorage.setItem('auth', JSON.stringify(data))
    })

    // Browser extension takes some time to load
    setTimeout(() => {
      runInAction(() => {
        this.hasExtension = !!getNostrExtension()
      })
    }, 2000)
  }

  get currentUser() {
    return userStore.get(this.pubkey)
  }

  get isLogged() {
    return !!this.pubkey
  }

  on(args: { onLogin?: (pubkey: string) => void; onLogout?: () => void }) {
    return reaction(
      () => this.pubkey,
      (pubkey) => {
        return pubkey ? args.onLogin?.(pubkey) : args.onLogout?.()
      },
    )
  }

  isPubkeyValid(pubkey: string | undefined) {
    return pubkey !== undefined
  }

  async loginWithNostrExtension() {
    const pubkey = await getNostrExtensionPublicKey()
    if (pubkey) {
      this.addAccount(pubkey)
      this.selectAccount(pubkey)
    }
  }

  loginWithPubkey(pubkey: string) {
    if (this.isPubkeyValid(pubkey)) {
      this.addAccount(pubkey)
      this.selectAccount(pubkey)
    }
  }

  logout() {
    if (this.pubkey) {
      const pubkey = this.pubkey
      this.removeAccount(pubkey)
      this.pubkey = undefined
    }
  }

  selectAccount(pubkey: string) {
    if (this.accounts.has(pubkey)) {
      this.pubkey = pubkey
    }
  }

  addAccount(pubkey: string) {
    this.accounts.add(pubkey)
  }

  removeAccount(pubkey: string) {
    this.accounts.delete(pubkey)
  }
}

export const authStore = new AuthStore()
