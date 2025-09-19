import { selectedLastSeenAtom } from '@/atoms/lastSeen.atoms'
import { createNotificationFeedAtoms } from '@/atoms/modules.atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { createNotificationFeedModule, type NotificationFeedModule } from '../modules/createNotificationFeedModule'
import type { InfiniteEvents } from '../query/useQueryFeeds'
import { useSettings } from '../useSettings'
import { useFeedStateAtom } from './useFeed'

export type NotificationFeedState = ReturnType<typeof useNotificationFeedState>

export function useNotificationFeedState(module: NotificationFeedModule) {
  const { notificationsCompact } = useSettings()
  const [layout, setLayout] = useState<'compact' | 'normal'>(notificationsCompact ? 'compact' : 'normal')
  const feedAtoms = useMemo(() => createNotificationFeedAtoms(module), [module.id])
  const [includeReplies, setIncludeReplies] = useAtom(feedAtoms.includeReplies)
  const [includeMentions, setIncludeMentions] = useAtom(feedAtoms.includeMentions)

  const feed = useFeedStateAtom(feedAtoms, {
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
  })

  return {
    ...feed,
    layout,
    setLayout,
    includeReplies,
    includeMentions,
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
