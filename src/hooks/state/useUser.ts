import { userFamily } from '@/atoms/users.atoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useCurrentPubkey } from '../useAuth'

export type UserState = ReturnType<typeof useUserState>

type UserStateOptions = {
  syncFollows?: boolean
}

export function useUserState(pubkey?: string, options?: UserStateOptions) {
  const currentPubkey = useCurrentPubkey()
  const syncFollows = currentPubkey === pubkey ? true : !!options?.syncFollows
  const params = useMemo(() => ({ pubkey, syncFollows }), [pubkey, syncFollows])
  return useAtomValue(userFamily(params))
}
