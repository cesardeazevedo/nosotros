import type { Signer } from 'core/signers/signer'
import type { ObservableMap } from 'mobx'
import { autorun, makeAutoObservable, observable, reaction, runInAction } from 'mobx'
import { getNostrExtension, getNostrExtensionPublicKey } from 'nostr/nips/nip07.extensions'
import { userStore } from 'stores/nostr/users.store'
import { z } from 'zod'

const accountSchema = z.object({
  pubkey: z.string(),
  signer: z.enum(['nip07', 'nip46', 'readonly']),
})

const schema = z.object({
  accounts: z.array(z.tuple([z.string(), accountSchema])),
  pubkey: z.string(),
})

const item = localStorage.getItem('auth')
const parsed = schema.safeParse(JSON.parse(item || '{}'))
const data = parsed.success ? parsed.data : undefined

export type Account = z.infer<typeof accountSchema>

export class AuthStore {
  accounts: ObservableMap<string, Account>
  signer: Signer | undefined
  pubkey: string | undefined
  hasExtension?: boolean

  constructor() {
    makeAutoObservable(this, { accounts: false })

    this.accounts = observable.map(data?.accounts)
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

  get currentAccount() {
    if (this.pubkey) {
      return this.accounts.get(this.pubkey)
    }
  }

  get currentUser() {
    return userStore.get(this.pubkey)
  }

  get isLogged() {
    return !!this.pubkey
  }

  on(args: { onLogin?: (account: Account) => void; onLogout?: () => void }) {
    return reaction(
      () => this.currentAccount,
      (account) => {
        return account ? args.onLogin?.(account) : args.onLogout?.()
      },
    )
  }

  isPubkeyValid(pubkey: string | undefined) {
    return pubkey !== undefined
  }

  async loginWithNostrExtension() {
    const pubkey = await getNostrExtensionPublicKey()
    if (pubkey) {
      this.addAccount({ pubkey, signer: 'nip07' })
      this.selectAccount(pubkey)
    }
  }

  loginWithPubkey(pubkey: string) {
    if (this.isPubkeyValid(pubkey)) {
      this.addAccount({ pubkey, signer: 'readonly' })
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

  addAccount(account: Account) {
    const { pubkey, signer } = account
    this.accounts.set(pubkey, { pubkey, signer })
  }

  removeAccount(pubkey: string) {
    this.accounts.delete(pubkey)
  }
}

export const authStore = new AuthStore()
