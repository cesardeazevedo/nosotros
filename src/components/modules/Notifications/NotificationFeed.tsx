import type { Props as ListProps } from '@/components/modules/Feed/FeedList'
import { useCurrentUser } from '@/hooks/useRootStore'
import { metadataSymbol } from '@/nostr/types'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { observer } from 'mobx-react-lite'
import { useObservable } from 'observable-hooks'
import { EMPTY } from 'rxjs'
import { Feed } from '../Feed/Feed'
import { NotificationItem } from './NotificationItem'
import { NotificationLoading } from './NotificationLoading'

type Props = {
  feed: FeedStore
} & Pick<ListProps, 'column' | 'header'>

export const NotificationFeed = observer(function NotificationFeed(props: Props) {
  const { feed, ...rest } = props
  const user = useCurrentUser()

  useObservable(() => {
    return EMPTY
  })

  return (
    <Feed
      feed={feed}
      filter={(event) => {
        const { options } = feed
        if (options.includeMentions === false && event[metadataSymbol].isRoot) return false
        if (options.includeReplies === false && event.kind === 1 && !event[metadataSymbol].isRoot) return false
        if (options.includeMuted === false && !!user?.isEventMuted(event)) return false
        return true
      }}
      loading={<NotificationLoading rows={8} />}
      render={(event) => <NotificationItem lastSeen={0} event={event} />}
      {...rest}
    />
  )
})
