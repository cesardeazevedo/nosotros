import { DEFAULT_RELAYS } from 'constants/relays'
import { first, map, of, shareReplay, timeout } from 'rxjs'
import { selectRelays } from './operators/fromUserRelays'
import { trackUserRelays } from './operators/trackUserRelays'

export const trackPubkey = (pubkey: string) => {
  return trackUserRelays(pubkey).pipe(
    map((userRelays) => selectRelays(Object.values(userRelays)[0])),
    first(),
    timeout({
      first: 3000,
      with: () => of(DEFAULT_RELAYS)
    }),
    shareReplay(),
  )
}
