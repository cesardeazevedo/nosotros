import { selectedLastSeenAtom } from '@/atoms/lastSeen.atoms'
import { createNotificationFeedAtoms } from '@/atoms/modules.atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { createNotificationFeedModule, type NotificationFeedModule } from '../modules/createNotificationFeedModule'
import { useSettings } from '../useSettings'
import { useFeedStateAtom } from './useFeed'

export type NotificationFeedState = ReturnType<typeof useNotificationFeedState>

export function useNotificationFeedState(module: NotificationFeedModule) {
  const { notificationsCompact } = useSettings()
  const [layout, setLayout] = useState<'compact' | 'normal'>(notificationsCompact ? 'compact' : 'normal')
  const feedAtoms = useMemo(() => createNotificationFeedAtoms(module), [module.id])
  const [includeReplies, setIncludeReplies] = useAtom(feedAtoms.includeReplies)
  const [includeMentions, setIncludeMentions] = useAtom(feedAtoms.includeMentions)
  const [includeMuted, setIncludeMuted] = useAtom(feedAtoms.includeMuted)

  const feed = useFeedStateAtom(feedAtoms)

  return {
    ...feed,
    layout,
    setLayout,
    includeReplies,
    includeMentions,
    includeMuted,
    setIncludeMentions,
    setIncludeMuted,
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
