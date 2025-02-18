import type { NostrContext } from '@/nostr/context'
import type { NotesFeedSubscription } from '@/stores/feeds/feed.notes'
import { useEffect } from 'react'

export function useFeedSubscription(feed: NotesFeedSubscription, ctx: NostrContext) {
  // We usually use observable-hooks but in this case we don't want to unsubscribe on unmount
  useEffect(() => {
    if (!feed.started) {
      feed.toggle('started', true)
      feed.subscribe(ctx).subscribe()
    }
  }, [feed])
}
