import { getNostrExtension, getNostrExtensionPublicKey } from '@/nostr/nips/nip07.extensions'
import { makeAutoObservable, runInAction } from 'mobx'
import { firstValueFrom } from 'rxjs'
import { authStore } from '.'
import { rootStore } from '../root.store'
import type { NostrContext } from './nostr.context'

class SignInStore {
  hasExtension = false

  constructor(private context: NostrContext) {
    makeAutoObservable(this)
    // Browser extension takes some time to load
    setTimeout(() => {
      runInAction(() => {
        this.hasExtension = !!getNostrExtension()
      })
    }, 2000)
  }

  async loginWithNostrExtension() {
    const pubkey = await getNostrExtensionPublicKey()
    if (pubkey) {
      authStore.addAccount({ pubkey, signer: 'nip07' })
    }
  }

  loginWithPubkey(pubkey: string) {
    authStore.addAccount({ pubkey, signer: this.hasExtension ? 'nip07' : 'readonly' })
  }

  async loginWithNostrAddress(address: string) {
    const [name, url] = address.split('@')
    const response = await firstValueFrom(this.context.client.dns.fetch(url))
    const pubkey = response.names?.[name]
    if (pubkey) {
      this.loginWithPubkey(pubkey)
      return true
    }
    return false
  }
}

export const signinStore = new SignInStore(rootStore.rootContext)
