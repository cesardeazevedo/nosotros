import { RootStoreContext } from '@/components/providers/RootStoreProvider'
import { userStore } from '@/stores/users/users.store'
import { useContext } from 'react'

export const useRootStore = () => useContext(RootStoreContext)
export const useRootContext = () => useRootStore().globalContext
export const useGlobalSettings = () => useRootStore().globalSettings
export const useGlobalNostrSettings = () => useRootStore().globalContext
export const useCurrentAccount = () => useRootStore().auth.selected
export const useCurrentSigner = () => useCurrentAccount()?.signer?.signer
export const useCurrentPubkey = () => useCurrentAccount()?.pubkey
export const useCurrentUser = () => userStore.get(useCurrentAccount()?.pubkey)
