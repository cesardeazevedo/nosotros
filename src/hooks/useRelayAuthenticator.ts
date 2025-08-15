import { whitelist$ } from '@/atoms/relayAuth.atoms'
import { createAuthenticator } from '@/core/observable/createAuthenticator'
import { pool } from '@/nostr/pool'
import { pluckFirst, useObservable, useSubscription } from 'observable-hooks'
import { filter, ignoreElements, mergeMap } from 'rxjs'
import { useCurrentSigner } from './useAuth'

export function useRelayAuthenticator() {
  const signer = useCurrentSigner()
  const sub = useObservable<void, (typeof signer)[]>(
    (signer$) =>
      signer$.pipe(
        pluckFirst,
        filter(Boolean),
        mergeMap((signer) => {
          return createAuthenticator({
            pool: pool,
            auto: false,
            whitelist: whitelist$,
            signer,
          })
        }),
        ignoreElements(),
      ),
    [signer],
  )
  useSubscription(sub)
}
