import type { Props as ListProps } from '@/components/modules/Feed/FeedList'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NotificationFeedState } from '@/hooks/state/useNotificationFeed'
import { memo, useCallback, useState } from 'react'
import { Feed } from '../Feed/Feed'
import { NotificationItem } from './NotificationItem'
import { NotificationLoading } from './NotificationLoading'

type Props = {
  feed: NotificationFeedState
} & Pick<ListProps, 'column' | 'header'>

export const NotificationFeed = memo(function NotificationFeed(props: Props) {
  const { feed, ...rest } = props
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <Feed
      feed={feed}
      loading={<NotificationLoading rows={8} />}
      render={useCallback(
        (event: NostrEventDB) => (
          <NotificationItem
            owner={feed.filter['#p']?.[0]}
            event={event}
            selected={selected === event.id}
            onClick={() => setSelected(event.id)}
            dense={feed.compact}
          />
        ),
        [selected, feed.compact],
      )}
      {...rest}
    />
  )
})
