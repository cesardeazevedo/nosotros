import { APP_DESCRIPTION, APP_NAME } from '@/constants/app'
import type { NIP46RemoteSigner } from '@/core/signers/nip46.signer'
import { nip05 } from '@/nostr/nip05'
import { decodeNIP19 } from '@/utils/nip19'
import { bytesToHex } from '@noble/hashes/utils'
import { makeAutoObservable } from 'mobx'
import { lazyObservable } from 'mobx-utils'
import type { NostrEvent, UnsignedEvent } from 'nostr-tools'
import { firstValueFrom } from 'rxjs'
import invariant from 'tiny-invariant'
import { rootStore } from '../root.store'
import { SignerNIP46 } from '../signers/signer.nip46'

const PAGES = {
  SELECT: 0,
  READ_ONLY: 1,
  NOSTR_EXTENSION: 2,
  REMOTE_SIGN: 3,
  REMOTE_SIGN_NOSTR_CONNECT: 4,
} as const

type Pages = keyof typeof PAGES

const auth = rootStore.auth

type NostrExtension = {
  getPublicKey(): Promise<string>
  signEvent(event: UnsignedEvent): Promise<NostrEvent>
}

export function getNostrExtension() {
  if ('nostr' in window) {
    return window.nostr as NostrExtension
  }
}

export async function getNostrExtensionPublicKey() {
  const nostr = getNostrExtension()
  if (nostr) {
    return await nostr.getPublicKey()
  }
}

export const signinStore = makeAutoObservable({
  page: 'SELECT' as Pages,
  prevPage: 'SELECT' as Pages,
  submitting: false,
  inputPubkey: '',
  response: '',
  error: '',

  hasExtension: lazyObservable((sink) => {
    setTimeout(() => sink('nostr' in window), 2000)
    sink(undefined)
  }),

  goTo(page: Pages) {
    this.prevPage = this.page
    this.page = page
  },

  back() {
    this.prevPage = this.page
    this.page = 'SELECT'
  },

  setReadonlyInput(value: string) {
    const decoded = decodeNIP19(value)
    switch (decoded?.type) {
      case 'npub': {
        this.inputPubkey = decoded.data
        break
      }
      case 'nprofile': {
        this.inputPubkey = decoded.data.pubkey
        break
      }
    }
  },

  setReponse(msg: string) {
    this.response = msg
  },

  setError(msg: string) {
    this.error = msg
  },

  getSlideDirection(slide: Pages) {
    const nextStep = PAGES[slide]
    const step = PAGES[this.page]
    const prevStep = PAGES[this.prevPage]
    if (nextStep > step) return 'left'
    if (nextStep < step) return 'right'
    if (prevStep < nextStep) return 'left'
    if (prevStep > nextStep) return 'right'
    return 'left'
  },

  reset() {
    this.page = 'SELECT'
    this.prevPage = 'SELECT'
    this.error = ''
    this.response = ''
    this.inputPubkey = ''
  },

  matches(page: Pages) {
    return this.page === page
  },

  async pasteClipboard() {
    const permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName })
    invariant(permissionStatus.state === 'granted', 'Clipboard permission rejected')
    return await window.navigator.clipboard.readText()
  },

  async submitNostrExtension() {
    const pubkey = await getNostrExtensionPublicKey()
    invariant(pubkey, 'Pubkey permission rejected')
    auth.login({
      pubkey,
      signer: {
        name: 'nip07',
      },
    })
    this.reset()
  },

  submitReadonly(pubkey: string) {
    auth.login({ pubkey })
    this.reset()
  },

  async submitNostrAddress(address: string) {
    const [name, url] = address.split('@')
    const response = await firstValueFrom(nip05.fetch(url, name))
    const pubkey = response.names?.[name]
    invariant(pubkey, 'Pubkey not found on remote server')
    this.submitReadonly(pubkey)
    return pubkey
  },

  async submitNostrConnect(signer: NIP46RemoteSigner, relay: string) {
    const [, { result: pubkey }] = await signer.getPublicKey()
    auth.login({
      pubkey,
      signer: {
        name: 'nip46',
        params: {
          name: 'nip46',
          method: {
            method: 'nostrconnect',
            relay,
          },
          secret: signer.secret,
          clientSecret: bytesToHex(signer.clientSigner.secret),
        },
      },
    })
    this.setReponse('Authorized')
    setTimeout(() => this.reset())
    return true
  },

  async submitBunker(bunkerUrl: string) {
    invariant(bunkerUrl, 'Bunker not set')

    const signer = SignerNIP46.create({
      name: 'nip46',
      params: {
        name: APP_NAME,
        description: APP_DESCRIPTION,
        method: {
          method: 'bunkerurl',
          bunkerUrl,
        },
      },
    })

    try {
      const [, res] = await signer.signer.connect()
      const [, { result: pubkey }] = await signer.signer.getPublicKey()
      auth.login({
        pubkey,
        signer: {
          ...signer,
          params: {
            ...signer.params,
            secret: signer.signer.secret,
            clientSecret: bytesToHex(signer.signer.clientSigner.secret),
          },
        },
      })
      this.setReponse('Authorized')
      this.reset()
      return res
    } catch (res) {
      const error = res as Error
      console.error(error)
      this.setReponse('')
      this.setError(error.message)
    }
  },
})
