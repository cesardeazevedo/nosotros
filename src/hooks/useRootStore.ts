import { RootStoreContext } from '@/components/providers/RootStoreProvider'
import { useContext } from 'react'

export const useRootStore = () => useContext(RootStoreContext)
export const useRootContext = () => useRootStore().rootContext
export const useGlobalSettings = () => useRootStore().globalSettings
export const useGlobalNostrSettings = () => useRootStore().nostrSettings
export const useCurrentAccount = () => useRootStore().auth.selected
export const useCurrentPubkey = () => useCurrentAccount()?.pubkey
export const useCurrentUser = () => useCurrentAccount()?.context.user
