import { userFamily } from '@/atoms/users.atoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useCurrentPubkey } from '../useAuth'

export type UserState = ReturnType<typeof useUserState>

type UserStateOptions = {
  fullUserSync?: boolean
}

export function useUserState(pubkey?: string, options?: UserStateOptions) {
  const currentPubkey = useCurrentPubkey()
  const fullUserSync = currentPubkey === pubkey ? true : !!options?.fullUserSync
  const params = useMemo(() => ({ pubkey, fullUserSync }), [pubkey, fullUserSync])
  return useAtomValue(userFamily(params))
}
