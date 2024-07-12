import type { UserRelayDB } from 'db/types'
import { storage } from 'nostr/storage'
import { filter, from } from 'rxjs'

export type RelaySelectionConfig = {
  permission?: UserRelayDB['permission']
  blacklist?: Map<string, unknown>
  ignore?: Map<string, unknown>
  max?: number
}

export function selectRelays(userRelays: UserRelayDB[], config?: RelaySelectionConfig) {
  return userRelays
    .filter((data) => !config?.blacklist?.has(data.relay))
    .filter((data) => !config?.ignore?.has(data.relay))
    .filter((data) => data.permission === config?.permission)
    .slice(0, config?.max || 20)
    .flatMap((x) => x.relay)
}

export function fromUserRelay(author: string) {
  return from(storage.queryUserRelay(author)).pipe(filter((res) => res.length > 0))
}
