import { STORAGE_ACCOUNTS_KEY } from '@/constants/localStorage'
import type { Signer } from 'core/signers/signer'
import type { ObservableMap } from 'mobx'
import { autorun, makeAutoObservable, observable, reaction } from 'mobx'
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

export type Account = z.infer<typeof accountSchema>

export class AuthStore {
  accounts: ObservableMap<string, Account>
  signer?: Signer
  pubkey: string | undefined

  constructor() {
    const { accounts, pubkey } = this.deserialize
    this.accounts = accounts
    this.pubkey = pubkey

    autorun(() => {
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(this.serialize))
    })

    makeAutoObservable(this, { accounts: false })
  }

  get deserialize() {
    const item = localStorage.getItem(STORAGE_ACCOUNTS_KEY)
    const parsed = schema.safeParse(JSON.parse(item || '{}'))
    const data = parsed.success ? parsed.data : undefined
    return {
      pubkey: data?.pubkey,
      accounts: observable.map(data?.accounts),
    }
  }

  get serialize() {
    return {
      pubkey: this.pubkey,
      accounts: Array.from(this.accounts),
    }
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
    this.selectAccount(pubkey)
  }

  removeAccount(pubkey: string) {
    this.accounts.delete(pubkey)
  }
}

export const authStore = new AuthStore()
