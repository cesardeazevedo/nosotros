import type { RelayInformation } from 'nostr-tools/nip11'
import { fromFetch } from 'rxjs/fetch'

export function fetchRelayInfo(url: string) {
  return fromFetch<RelayInformation>('https://' + url.replace('wss://', ''), {
    selector: (res) => res.json(),
    method: 'GET',
    credentials: 'omit',
    priority: 'low',
    headers: {
      Accept: 'application/nostr+json',
    },
  })
}
