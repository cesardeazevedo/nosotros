import { DEFAULT_RELAYS } from 'constants/relays'
import { first, map, of, shareReplay, timeout } from 'rxjs'
import { trackUserRelays } from './operators/trackUserRelays'

export function myRelays(pubkey: string) {
  return trackUserRelays(pubkey).pipe(
    map((x) => x[1]),
    first(),
    timeout({
      first: 3000,
      with: () => of(DEFAULT_RELAYS),
    }),
    shareReplay(),
  )
}
