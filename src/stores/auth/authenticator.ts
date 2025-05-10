import { createAuthenticator } from '@/core/observable/createAuthenticator'
import type { Signer } from '@/core/signers/signer'
import { pool } from '@/nostr/pool'
import { filter, ignoreElements, mergeMap } from 'rxjs'
import { toStream } from '../helpers/toStream'
import { rootStore } from '../root.store'

const signer = toStream(() => rootStore.auth.selected?.signer?.signer).pipe(filter((signer) => !!signer))
const whitelist = toStream(() => [...rootStore.globalContext.authWhitelist.values()])

export function createStoreAuthenticator() {
  return signer.pipe(
    mergeMap((signer: Signer) => {
      return createAuthenticator({
        pool,
        signer,
        whitelist: whitelist,
        auto: false,
      })
    }),
    ignoreElements(),
  )
}
