import { APP_DESCRIPTION, APP_NAME } from '@/constants/app'
import { getNostrExtensionPublicKey } from '@/nostr/nips/nip07.extensions'
import { bytesToHex } from '@noble/hashes/utils'
import { makeAutoObservable } from 'mobx'
import { lazyObservable } from 'mobx-utils'
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

export const signinStore = makeAutoObservable({
  page: 'SELECT' as Pages,
  prevPage: 'SELECT' as Pages,
  submitting: false,
  bunkerUrl: '',
  response: '',
  error: '',

  hasExtension: lazyObservable((sink) => {
    setTimeout(() => sink(true), 2000)
    sink(false)
  }),

  goTo(page: Pages) {
    this.prevPage = this.page
    this.page = page
  },

  back() {
    this.prevPage = this.page
    this.page = 'SELECT'
  },

  setBunker(bunker: string) {
    this.bunkerUrl = bunker.trim()
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
    this.bunkerUrl = ''
    this.error = ''
    this.response = ''
  },

  matches(page: Pages) {
    return this.page === page
  },

  async pasteClipboard() {
    const permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName })
    invariant(permissionStatus.state !== 'granted', 'Clipboard permission rejected')
    return await window.navigator.clipboard.readText()
  },

  async submitNostrExtension() {
    const pubkey = await getNostrExtensionPublicKey()
    invariant(pubkey, 'Pubkey permission rejected')
    auth.login({
      pubkey,
      context: {
        signer: {
          name: 'nip07',
        },
        options: {
          pubkey,
        },
      },
    })
  },

  submitReadonly(pubkey: string) {
    auth.login({
      pubkey,
      context: {
        signer: undefined,
        options: {
          pubkey,
        },
      },
    })
  },

  async submitNostrAddress(address: string) {
    const [name, url] = address.split('@')
    const response = await firstValueFrom(rootStore.rootContext.client.dns.fetch(url))
    const pubkey = response.names?.[name]
    invariant(pubkey, 'Pubkey not found on remote server')
    this.submitReadonly(pubkey)
    return pubkey
  },

  async submitBunker() {
    invariant(this.bunkerUrl, 'Bunker not set')

    const signer = SignerNIP46.create({
      name: 'nip46',
      params: {
        name: APP_NAME,
        description: APP_DESCRIPTION,
        method: {
          method: 'bunkerurl',
          bunkerUrl: this.bunkerUrl,
        },
      },
    })

    try {
      const [bunker, res] = await signer.signer.connect()
      const { pubkey } = bunker
      auth.login({
        pubkey,
        context: {
          signer: {
            ...signer,
            params: {
              ...signer.params,
              clientSecret: bytesToHex(signer.signer.clientSigner.secret),
            },
          },
          options: {
            pubkey,
          },
        },
      })
      this.setReponse('Authorized')
      return res
    } catch (res) {
      const error = res as Error
      this.setReponse('')
      this.setError(error.message)
    }
  },
})
