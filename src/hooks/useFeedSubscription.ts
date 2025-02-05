import type { NostrClient } from '@/nostr/nostr'
import type { NotesFeedSubscription } from '@/stores/feeds/feed.notes'
import { useEffect } from 'react'

export function useFeedSubscription(feed: NotesFeedSubscription, client: NostrClient) {
  // We usually use observable-hooks but in this case we don't want to unsubscribe on unmount
  useEffect(() => {
    if (!feed.started) {
      feed.toggle('started', true)
      feed.subscribe(client).subscribe()
    }
  }, [feed])
}
