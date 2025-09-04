import { DEFAULT_RELAY_MONITOR_PUBKEY } from '@/constants/relays'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { RelayInformation } from 'nostr-tools/nip11'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { RelayMonitorModule } from '../modules/createRelayMonitorModule'
import { queryClient } from '../query/queryClient'
import { queryKeys } from '../query/queryKeys'
import { useFeedState } from './useFeed'

export type RelayMonitorFeed = ReturnType<typeof useRelayMonitorFeed>

export function useRelayMonitorFeed(options: RelayMonitorModule) {
  const feed = useFeedState(options)

  useEffect(() => {
    // Prepopulate nip11 from the event content
    feed.query.data?.pages.flat().forEach((event) => {
      if (event.content && event.content !== '{}') {
        const nip11 = JSON.parse(event.content) as RelayInformation
        const url = event.tags.find((x) => x[0] === 'd')?.[1]
        if (url) {
          if (!queryClient.getQueryData(queryKeys.relayInfo(url))) {
            queryClient.setQueryData(queryKeys.relayInfo(url), { ...nip11, url })
          }
        }
      }
    })
  }, [feed.query.data])

  const [selected, setSelectedMonitor] = useState<string | undefined>(DEFAULT_RELAY_MONITOR_PUBKEY)

  const all = useMemo(() => {
    const pages = feed.query.data?.pages || []
    return pages.flat()
  }, [feed.query.data])

  const groupByMonitor = useMemo(() => {
    const map = new Map<string, NostrEventDB[]>()
    for (const ev of all) {
      const key = ev.pubkey
      const list = map.get(key)
      if (list) {
        list.push(ev)
      } else {
        map.set(key, [ev])
      }
    }
    return map
  }, [all])

  const seenMonitors = useMemo(() => Array.from(groupByMonitor.keys()), [groupByMonitor])

  const list = useMemo(() => {
    return selected ? [...(groupByMonitor.get(selected) || [])] : []
  }, [selected, groupByMonitor])

  const listMonitors = seenMonitors

  const getByMonitor = useCallback(
    (monitor: string | undefined) => {
      return monitor ? [...(groupByMonitor.get(monitor) || [])] : []
    },
    [groupByMonitor],
  )

  const getTotal = useCallback(() => {
    return getByMonitor(selected).length
  }, [selected, getByMonitor])

  const select = useCallback((monitor: string) => setSelectedMonitor(monitor), [])

  return {
    ...feed,
    selected,
    list,
    listMonitors,
    getByMonitor,
    getTotal,
    select,
    setSelectedMonitor,
  }
}
