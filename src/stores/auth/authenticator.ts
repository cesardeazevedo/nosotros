import { createAuthenticator } from '@/core/observable/createAuthenticator'
import type { Signer } from '@/core/signers/signer'
import type { NostrContext } from '@/nostr/context'
import { getRelaysFromContext } from '@/nostr/observables/getRelaysFromContext'
import { pool } from '@/nostr/pool'
import { READ, WRITE } from '@/nostr/types'
import { identity } from 'observable-hooks'
import { filter, ignoreElements, mergeMap, toArray } from 'rxjs'
import { toStream } from '../helpers/toStream'
import { rootStore } from '../root.store'

const signer$ = toStream(() => rootStore.auth.selected?.signer?.signer).pipe(filter((signer) => !!signer))

export function createContextAuthenticator(ctx: NostrContext) {
  return signer$.pipe(
    mergeMap((signer: Signer) => {
      const whitelist = getRelaysFromContext({ ...ctx, permission: READ | WRITE, maxRelaysPerUser: 20 }).pipe(
        mergeMap(identity),
        toArray(),
      )
      return createAuthenticator({
        pool,
        signer,
        whitelist,
        auto: false,
      })
    }),
    ignoreElements(),
  )
}
