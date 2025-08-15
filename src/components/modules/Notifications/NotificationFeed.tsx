import type { Props as ListProps } from '@/components/modules/Feed/FeedList'
import type { NotificationFeedState } from '@/hooks/state/useNotificationFeed'
import { memo } from 'react'
import { Feed } from '../Feed/Feed'
import { NotificationItem } from './NotificationItem'
import { NotificationLoading } from './NotificationLoading'

type Props = {
  feed: NotificationFeedState
} & Pick<ListProps, 'column' | 'header'>

export const NotificationFeed = memo(function NotificationFeed(props: Props) {
  const { feed, ...rest } = props

  return (
    <Feed
      feed={feed}
      loading={<NotificationLoading rows={8} />}
      render={(event) => <NotificationItem owner={feed.filter['#p']?.[0]} event={event} />}
      {...rest}
    />
  )
})
