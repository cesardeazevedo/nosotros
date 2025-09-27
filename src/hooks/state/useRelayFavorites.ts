import { RELAY_SELECTION_IGNORE } from '@/constants/relays'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { useMemo } from 'react'
import { createRelayFavoriteModule } from '../modules/createRelayFavoritesModule'
import { useFeedState } from '../state/useFeed'

const ignoreRelays = new Set(RELAY_SELECTION_IGNORE)

export function useRelayFavorites() {
  const module = useMemo(() => createRelayFavoriteModule(), [])
  const feed = useFeedState(module)

  return useMemo(() => {
    const events = feed.query.data?.pages.flat() ?? []
    const counts = new Map<string, number>()

    for (const event of events) {
      for (const tag of event.tags) {
        if (tag[0] === 'relay' && tag[1].startsWith('wss://')) {
          const url = formatRelayUrl(tag[1])
          counts.set(url, (counts.get(url) ?? 0) + 1)
        }
      }
    }

    return [...counts.entries()]
      .filter(([relay]) => !ignoreRelays.has(relay))
      .sort((a, b) => b[1] - a[1])
      .map(([relay]) => relay)
  }, [feed.query.data])
}
