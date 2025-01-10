import type { UserRelay } from './parseRelayList'

export type RelaySelectionConfig = {
  timeout?: number
  permission?: UserRelay['permission']
  blacklist?: Map<string, unknown>
  ignore?: Set<string>
  maxRelaysPerUser?: number
}

export function selectRelays(data: UserRelay[], config?: RelaySelectionConfig) {
  return data
    .filter((data) => !config?.blacklist?.has(data.relay))
    .filter((data) => !config?.ignore?.has(data.relay))
    .filter((data) => {
      return config?.permission !== undefined ? !!(data.permission & config.permission) || !data.permission : true
    })
    .slice(0, config?.maxRelaysPerUser || 10)
}
