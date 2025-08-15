import type { Observable } from 'rxjs'
import { catchError, combineLatestWith, distinct, EMPTY, filter, map, mergeMap, scan } from 'rxjs'
import type { Pool } from '../pool'
import type { Signer } from '../signers/signer'
import { authenticate } from './authenticate'

type RelayAuthenticatorOptions = {
  signer: Signer
  pool: Pool
  auto: boolean
  whitelist: Observable<string[]>
}

export function createAuthenticator(options: RelayAuthenticatorOptions) {
  const { pool, signer, auto, whitelist } = options
  return pool.auths$.pipe(
    scan((acc, value) => new Map([...acc, value]), new Map<string, string>()),
    combineLatestWith(whitelist),
    mergeMap(([relays, whitelists]) => whitelists.map((relay) => [relays, relay] as const)),
    filter(([relays, whitelistedRelay]) => auto || relays.has(whitelistedRelay)),
    distinct(([relays, url]) => url + relays.get(url) || ''),
    mergeMap(([relays, url]) => {
      const relay = pool.get(url)
      const challenge = relays.get(url)
      if (relay && challenge) {
        return authenticate({ relay, challenge, signer }).pipe(
          map((msg) => [url, msg[0]] as const),
          catchError(() => EMPTY),
        )
      }
      return EMPTY
    }),
  )
}
