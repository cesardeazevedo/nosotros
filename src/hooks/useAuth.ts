import { authAtom, currentAccountAtom, loginAtom, logoutAtom, selectedPubkeyAtom, signerAtom } from '@/atoms/auth.atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useUserState } from './state/useUser'

export function useAuth() {
  return useAtomValue(authAtom)
}

export function useCurrentPubkey() {
  return useAtomValue(selectedPubkeyAtom)
}

export function useCurrentAccount() {
  return useAtomValue(currentAccountAtom)
}

export function useCurrentSigner() {
  return useAtomValue(signerAtom)
}

export function useCurrentUser() {
  const pubkey = useCurrentPubkey()
  return useUserState(pubkey)
}

export function useLogin() {
  return useSetAtom(loginAtom)
}

export function useLogout() {
  return useSetAtom(logoutAtom)
}
