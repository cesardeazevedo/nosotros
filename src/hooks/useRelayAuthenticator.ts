import { createStoreAuthenticator } from '@/stores/auth/authenticator'
import { useObservable, useSubscription } from 'observable-hooks'

export function useRelayAuthenticator() {
  const sub = useObservable(() => createStoreAuthenticator())
  useSubscription(sub)
}
