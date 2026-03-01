import { createNotificationFeedAtoms } from '@/atoms/feed.notification.atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { createNotificationFeedModule, type NotificationFeedModule } from '../modules/createNotificationFeedModule'
import { useFeedStateAtom } from './useFeed'

export type NotificationFeedState = ReturnType<typeof useNotificationFeedState>

export function useNotificationFeedState(module: NotificationFeedModule) {
  const feedAtoms = useMemo(() => createNotificationFeedAtoms(module), [module.id])
  const [compact, setCompact] = useAtom(feedAtoms.compact)
  const [includeReplies, setIncludeReplies] = useAtom(feedAtoms.includeReplies)
  const [includeMentions, setIncludeMentions] = useAtom(feedAtoms.includeMentions)
  const [includeMuted, setIncludeMuted] = useAtom(feedAtoms.includeMuted)

  const feed = useFeedStateAtom(feedAtoms)

  return {
    ...feed,
    compact,
    setCompact,
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
  const feedAtoms = useMemo(() => createNotificationFeedAtoms(module), [module.id])
  return useAtomValue(feedAtoms.unseenCount)
}
