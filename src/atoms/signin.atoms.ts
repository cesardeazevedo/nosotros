import { APP_DESCRIPTION, APP_NAME } from '@/constants/app'
import { FALLBACK_RELAYS } from '@/constants/relays'
import type { NIP46RemoteSignerOptions } from '@/core/signers/nip46.signer'
import { NIP46RemoteSigner } from '@/core/signers/nip46.signer'
import { queryClient } from '@/hooks/query/queryClient'
import { nip05QueryOptions } from '@/hooks/query/useNIP05'
import { decodeNIP19 } from '@/utils/nip19'
import { bytesToHex } from '@noble/hashes/utils'
import { atom } from 'jotai'
import { nip19, type NostrEvent, type UnsignedEvent } from 'nostr-tools'
import { loginAtom } from './auth.atoms'

export const PAGES = {
  SELECT: 0,
  READ_ONLY: 1,
  NOSTR_EXTENSION: 2,
  REMOTE_SIGN: 3,
  REMOTE_SIGN_NOSTR_CONNECT: 4,
} as const

export type Pages = keyof typeof PAGES

type NostrExtension = {
  getPublicKey(): Promise<string>
  signEvent(event: UnsignedEvent): Promise<NostrEvent>
}

const defaultPage: Pages = 'SELECT'

export const pageAtom = atom<Pages>(defaultPage)
export const prevPageAtom = atom<Pages>(defaultPage)
export const submittingAtom = atom(false)
export const inputPubkeyAtom = atom('')
export const signinErrorAtom = atom('')
export const signinResponseAtom = atom('')

export const goToAtom = atom(null, (get, set, next: Pages) => {
  const current = get(pageAtom)
  set(prevPageAtom, current)
  set(pageAtom, next)
})

export const backToSelectAtom = atom(null, (get, set) => {
  const current = get(pageAtom)
  set(prevPageAtom, current)
  set(pageAtom, 'SELECT')
})

export const setResponseAtom = atom(null, (_get, set, msg: string) => {
  set(signinResponseAtom, msg)
})

export const setErrorAtom = atom(null, (_get, set, msg: string) => {
  set(signinErrorAtom, msg)
})

export const resetSigninAtom = atom(null, (_get, set) => {
  set(pageAtom, 'SELECT')
  set(prevPageAtom, 'SELECT')
  set(signinErrorAtom, '')
  set(signinResponseAtom, '')
  set(inputPubkeyAtom, '')
  set(submittingAtom, false)
})

export const hasExtensionAtom = atom(false)

hasExtensionAtom.onMount = (set) => {
  const detect = () => {
    if (typeof window === 'undefined') return false
    return 'nostr' in window
  }

  set(detect())

  const timer = setTimeout(() => {
    set(detect())
  }, 2000)

  return () => {
    clearTimeout(timer)
  }
}

export const slideDirectionAtom = atom((get) => {
  const current = get(pageAtom)
  const previous = get(prevPageAtom)

  function direction(to: Pages): 'left' | 'right' {
    const toIdx = PAGES[to]
    const curIdx = PAGES[current]
    const prevIdx = PAGES[previous]

    if (toIdx > curIdx) {
      return 'left'
    }
    if (toIdx < curIdx) {
      return 'right'
    }
    if (prevIdx < toIdx) {
      return 'left'
    }
    if (prevIdx > toIdx) {
      return 'right'
    }
    return 'left'
  }

  return direction
})

export const submitNostrExtensionAtom = atom(null, async (_, set) => {
  // @ts-ignore
  const nostr = window.nostr as NostrExtension

  if (!nostr || !nostr.getPublicKey) {
    throw new Error('Nostr extension not available')
  }

  const pubkey = await nostr.getPublicKey()

  if (!pubkey) {
    throw new Error('Permission denied by extension')
  }

  set(loginAtom, { pubkey, signer: { name: 'nip07' } })
  set(resetSigninAtom)

  return pubkey
})

export const submitBunkerAtom = atom(null, async (_, set, bunkerUrl: string) => {
  if (!bunkerUrl || !bunkerUrl.startsWith('bunker://')) {
    set(signinErrorAtom, 'Invalid bunker URL')
    set(signinResponseAtom, '')
    throw new Error('Invalid bunker URL')
  }

  set(signinErrorAtom, '')
  set(signinResponseAtom, 'Waiting for authorization...')

  try {
    const params: Omit<NIP46RemoteSignerOptions, 'auth'> = {
      name: APP_NAME,
      description: APP_DESCRIPTION,
      method: {
        method: 'bunkerurl',
        bunkerUrl,
      },
    }

    const signer = new NIP46RemoteSigner(params)

    await signer.connect()
    const [, { result: pubkey }] = await signer.getPublicKey()

    if (!pubkey) {
      throw new Error('Remote signer did not return a pubkey')
    }

    set(loginAtom, {
      pubkey,
      signer: {
        name: 'nip46',
        params: {
          ...params,
          remotePubkey: pubkey,
          secret: signer.secret,
          clientSecret: bytesToHex(signer.clientSigner.secret),
        },
      },
    })

    set(signinResponseAtom, 'Authorized')
    set(resetSigninAtom)
    return true
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to connect to bunker'
    set(signinErrorAtom, message)
    set(signinResponseAtom, '')
    throw new Error(message)
  }
})

export const submitNostrConnectAtom = atom(
  null,
  async (_get, set, payload: { signer: NIP46RemoteSigner; relay: string }) => {
    try {
      const [, { result: pubkey }] = await payload.signer.getPublicKey()

      if (!pubkey) {
        throw new Error('Remote signer did not return a pubkey')
      }

      set(loginAtom, {
        pubkey,
        signer: {
          name: 'nip46',
          params: {
            name: APP_NAME,
            remotePubkey: pubkey,
            description: APP_DESCRIPTION,
            method: { method: 'nostrconnect', relay: payload.relay },
            secret: payload.signer.secret,
            clientSecret: bytesToHex(payload.signer.clientSigner.secret),
          },
        },
      })

      set(signinResponseAtom, 'Authorized')
      set(resetSigninAtom)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect via NostrConnect'
      set(signinErrorAtom, message)
      set(signinResponseAtom, '')
      throw new Error(message)
    }
  },
)

export const setReadonlyInputAtom = atom(null, (_, set, raw: string) => {
  const value = (raw ?? '').trim()
  const decoded = decodeNIP19(value)
  if (decoded) {
    switch (decoded.type) {
      case 'npub': {
        set(inputPubkeyAtom, nip19.nprofileEncode({ pubkey: value, relays: FALLBACK_RELAYS }))
        break
      }
    }
  } else if (value.length === 64) {
    set(inputPubkeyAtom, nip19.nprofileEncode({ pubkey: value, relays: FALLBACK_RELAYS }))
  }
})

export const submitReadOnlyAtom = atom(null, (_, set, pubkey: string) => {
  set(loginAtom, { pubkey })
  set(resetSigninAtom)
  return pubkey
})

export const submitNostrAddressAtom = atom(null, async (_get, set, address: string) => {
  const [name] = address.split('@')

  try {
    const data = await queryClient.fetchQuery(nip05QueryOptions(address))
    const pubkey = data.names?.[name]

    if (!pubkey) {
      throw new Error('Pubkey not found on remote server')
    }

    set(loginAtom, { pubkey })
    set(resetSigninAtom)
    return pubkey
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to resolve Nostr address'
    set(signinErrorAtom, message)
    set(signinResponseAtom, '')
    throw new Error(message)
  }
})
