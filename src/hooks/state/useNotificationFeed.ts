import { selectedLastSeenAtom } from '@/atoms/lastSeen.atoms'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { createNotificationFeedModule, type NotificationFeedModule } from '../modules/createNotificationFeedModule'
import type { InfiniteEvents } from '../query/useQueryFeeds'
import { useFeedState } from './useFeed'

export type NotificationFeedState = ReturnType<typeof useNotificationFeedState>

export function useNotificationFeedState(options: NotificationFeedModule) {
  const [includeMuted, setIncludeMuted] = useState(options.includeMuted)
  const [includeMentions, setIncludeMentions] = useState(options.includeMentions)

  const feed = useFeedState({
    ...options,
    ctx: {
      subId: 'notification',
    },
    select: useCallback((data: InfiniteEvents) => {
      return {
        pages: data.pages.map((page) =>
          page.filter((event) => {
            if (includeMentions === false && event.metadata?.isRoot) return false
            // TODO
            // if (includeMuted === false && !!user?.isEventMuted(event.id)) return false
            if (options.includeReplies === false && event.kind === 1 && !event.metadata?.isRoot) return false
            return true
          }),
        ),
        pageParams: data.pageParams,
      }
    }, []),
  })

  return {
    ...feed,
    includeMuted,
    includeMentions,
    setIncludeMuted,
    setIncludeMentions,
  }
}

export function useUnseenNotificationsCount(pubkey: string) {
  const feed = useNotificationFeedState(createNotificationFeedModule(pubkey))
  const lastSeen = useAtomValue(selectedLastSeenAtom)?.notifications || Infinity
  return useMemo(() => {
    return feed.query.data?.pages.flat().filter((event) => event.created_at >= lastSeen).length || 0
  }, [feed.query.data, lastSeen])
}
