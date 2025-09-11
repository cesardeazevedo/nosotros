import { selectedLastSeenAtom } from '@/atoms/lastSeen.atoms'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { createNotificationFeedModule, type NotificationFeedModule } from '../modules/createNotificationFeedModule'
import type { InfiniteEvents } from '../query/useQueryFeeds'
import { useSettings } from '../useSettings'
import { useFeedState } from './useFeed'

export type NotificationFeedState = ReturnType<typeof useNotificationFeedState>

export function useNotificationFeedState(options: NotificationFeedModule) {
  const { notificationsCompact } = useSettings()
  const [layout, setLayout] = useState<'compact' | 'normal'>(notificationsCompact ? 'compact' : 'normal')
  const [includeMuted, setIncludeMuted] = useState(options.includeMuted)
  const [includeMentions, setIncludeMentions] = useState(options.includeMentions)
  const [includeReplies, setIncludeReplies] = useState(options.includeReplies ?? false)

  const module = useMemo(() => {
    return {
      ...options,
      includeReplies,
      ctx: {
        subId: 'notification',
      },
      select: (data: InfiniteEvents) => {
        return {
          pages: data.pages.map((page) =>
            page.filter((event) => {
              if (includeMentions === false && event.metadata?.isRoot) return false
              // TODO
              // if (includeMuted === false && !!user?.isEventMuted(event.id)) return false
              if (includeReplies === false && event.kind === 1 && !event.metadata?.isRoot) return false
              return true
            }),
          ),
          pageParams: data.pageParams,
        }
      },
    }
  }, [options, includeReplies, includeMentions, includeMuted])

  const feed = useFeedState(module)

  return {
    ...feed,
    layout,
    setLayout,
    includeReplies,
    includeMuted,
    includeMentions,
    setIncludeMuted,
    setIncludeMentions,
    setIncludeReplies,
  }
}

export function useUnseenNotificationsCount(pubkey: string) {
  const module = useMemo(() => createNotificationFeedModule(pubkey), [pubkey])
  const feed = useNotificationFeedState(module)
  const lastSeen = useAtomValue(selectedLastSeenAtom)?.notifications || Infinity
  return useMemo(() => {
    return feed.query.data?.pages.flat().filter((event) => event.created_at >= lastSeen).length || 0
  }, [feed.query.data, lastSeen])
}
