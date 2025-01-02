import type { UserRelayDB } from '../nips/nip65.relaylist'

export type RelaySelectionConfig = {
  timeout?: number
  permission?: UserRelayDB['permission']
  blacklist?: Map<string, unknown>
  ignore?: Set<string>
  maxRelaysPerUser?: number
}

export function selectRelays(data: UserRelayDB[], config?: RelaySelectionConfig) {
  return data
    .filter((data) => !config?.blacklist?.has(data.relay))
    .filter((data) => !config?.ignore?.has(data.relay))
    .filter((data) => {
      return config?.permission !== undefined ? !!(data.permission & config.permission) || !data.permission : true
    })
    .slice(0, config?.maxRelaysPerUser || 10)
}
