import { STORAGE_AUTH_KEY } from '@/constants/storage'
import { NIP07Signer } from '@/core/signers/nip07.signer'
import { NIP46RemoteSigner, type NIP46RemoteSignerOptions } from '@/core/signers/nip46.signer'
import { atom } from 'jotai'
import { observe } from 'jotai-effect'
import { atomWithReset, atomWithStorage } from 'jotai/utils'
import { store } from './store'

type SignerConfig = { name: 'nip07' } | { name: 'nip46'; params: Omit<NIP46RemoteSignerOptions, 'auth'> } | null

export type Account = {
  pubkey: string
  signer?: SignerConfig
}

type AuthState = {
  selected?: string
  accounts: Record<string, Account>
}

const DEFAULT_STATE: AuthState = { selected: undefined, accounts: {} }

export const authAtom = atomWithStorage<AuthState>(STORAGE_AUTH_KEY, DEFAULT_STATE, undefined, {
  getOnInit: true,
})

export const selectedPubkeyAtom = atom((get) => get(authAtom).selected)

export const selectedAccountAtom = atom((get) => {
  const state = get(authAtom)
  const selected = state.selected
  return selected ? state.accounts[selected] : undefined
})

export const currentAccountAtom = atom((get) => {
  const { selected, accounts } = get(authAtom)
  return selected ? accounts[selected] : undefined
})

export const signerAtom = atom<NIP07Signer | NIP46RemoteSigner | null>(null)

observe((get, set) => {
  const account = get(selectedAccountAtom)
  if (account?.signer) {
    switch (account.signer.name) {
      case 'nip07': {
        set(signerAtom, new NIP07Signer())
        break
      }
      case 'nip46': {
        set(signerAtom, new NIP46RemoteSigner(account.signer.params))
        break
      }
    }
  }
}, store)

export const resetAuth = atomWithReset(authAtom)

export const createAccountAtom = atom(null, (get, set, account: Account) => {
  const state = get(authAtom)
  set(authAtom, {
    ...state,
    accounts: {
      ...state.accounts,
      [account.pubkey]: account,
    },
  })
  set(selectAccountAtom, account.pubkey)
})

export const selectAccountAtom = atom(null, (get, set, pubkey: string) => {
  const state = get(authAtom)
  if (!state.accounts[pubkey]) {
    return
  }
  set(authAtom, { ...state, selected: pubkey })
})

export const deleteAccountAtom = atom(null, (get, set, pubkey: string) => {
  const state = get(authAtom)
  const { [pubkey]: _, ...rest } = state.accounts
  const selected = state.selected === pubkey ? undefined : state.selected
  set(authAtom, { accounts: rest, selected })
})

export const loginAtom = atom(null, (get, set, account: Account) => {
  set(authAtom, {
    accounts: {
      ...get(authAtom).accounts,
      [account.pubkey]: account,
    },
    selected: account.pubkey,
  })
})

export const logoutAtom = atom(null, (get, set) => {
  const state = get(authAtom)
  if (!state.selected) {
    return
  }
  const { [state.selected]: _removed, ...rest } = state.accounts
  set(authAtom, {
    selected: undefined,
    accounts: rest,
  })
})
