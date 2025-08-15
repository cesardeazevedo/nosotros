import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { fetchRelayInfo } from '@/core/observable/fetchRelayInfo'
import { dbSqlite } from '@/nostr/db'
import { queryOptions, useQuery } from '@tanstack/react-query'
import type { RelayInformation } from 'nostr-tools/nip11'
import { queryKeys } from './queryKeys'

export function relayInfoQueryOptions(_url: string) {
  const url = formatRelayUrl(_url)
  return queryOptions({
    queryKey: queryKeys.relayInfo(url),
    queryFn: async () => {
      const stored = await dbSqlite.queryRelayInfo([url])
      if (stored.length > 0) {
        if (Date.now() > (stored[0]?.timestamp || 0) + 86400 * 1000) {
          return stored[0] as RelayInformation
        }
      }
      const res = await fetchRelayInfo(url)
      if (res) {
        const data = { ...res, url, timestamp: Date.now() }
        dbSqlite.insertRelayInfo(data)
        return data
      }
      return null
    },
  })
}

export function useRelayInfo(url: string) {
  return useQuery(relayInfoQueryOptions(url))
}
