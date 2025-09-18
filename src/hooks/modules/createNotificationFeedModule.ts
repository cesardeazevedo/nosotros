import { Kind } from '@/constants/kinds'
import { queryKeys } from '../query/queryKeys'
import type { FeedModule } from '../query/useQueryFeeds'

export type NotificationFeedModule = FeedModule & {
  includeMuted: boolean
  includeMentions: boolean
}

export function createNotificationFeedModule(pubkey: string): NotificationFeedModule {
  const id = `notification_${pubkey}`
  const filter = {
    kinds: [Kind.Text, Kind.Comment, Kind.PublicMessage, Kind.Repost, Kind.Reaction, Kind.ZapReceipt],
    '#p': [pubkey],
    limit: 50,
  }
  return {
    id,
    type: 'inbox',
    queryKey: queryKeys.feed(id, filter),
    filter,
    ctx: {
      subId: 'notification',
    },
    scope: 'self',
    pageSize: 30,
    staleTime: 600000,
    autoUpdate: true,
    includeReplies: true,
    includeMuted: true,
    includeMentions: true,
  }
}
