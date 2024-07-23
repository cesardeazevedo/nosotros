import { formatRelayUrl } from 'core/helpers/formatRelayUrl'
import type { UserRelayDB } from 'db/types'
import { storage } from 'nostr/storage'
import { filter, from, map } from 'rxjs'

export type RelaySelectionConfig = {
  timeout?: number
  permission?: UserRelayDB['permission']
  blacklist?: Map<string, unknown>
  ignore?: Set<string>
  maxRelaysPerUser?: number
}

export function selectRelays(userRelays: UserRelayDB[], config?: RelaySelectionConfig) {
  return userRelays
    .filter((data) => !config?.blacklist?.has(formatRelayUrl(data.relay)))
    .filter((data) => !config?.ignore?.has(formatRelayUrl(data.relay)))
    .filter((data) => {
      return config?.permission !== undefined ? data.permission === config.permission || !data.permission : true
    })
    .slice(0, config?.maxRelaysPerUser || 6)
    .flatMap((x) => x.relay)
}

export function fromUserRelay(author: string, config?: RelaySelectionConfig) {
  return from(storage.queryUserRelay(author)).pipe(
    filter((res) => res.length > 0),
    map((res) => selectRelays(res, config)),
  )
}
