import { DEFAULT_RELAYS } from 'constants/relays'
import { map, of, shareReplay, timeout } from 'rxjs'
import { trackUserRelays } from './operators/trackUserRelays'

export function myRelays(pubkey: string) {
  return trackUserRelays(pubkey).pipe(
    map((userRelays) => userRelays.map((item) => item.relay)),
    timeout({
      first: 3000,
      with: () => of(DEFAULT_RELAYS),
    }),
    shareReplay(),
  )
}
