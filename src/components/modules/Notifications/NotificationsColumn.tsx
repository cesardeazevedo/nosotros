import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { DeckContext } from '@/components/elements/Deck/DeckContext'
import { FeedList } from '@/components/elements/Feed/FeedList'
import { NotificationItem } from '@/components/elements/Notification/NotificationItem'
import { NotificationLoading } from '@/components/elements/Notification/NotificationLoading'
import { NotificationSettings } from '@/components/elements/Notification/NotificationSettings'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import { useCurrentUser } from '@/hooks/useRootStore'
import type { NotificationModule } from '@/stores/modules/notification.module'
import { IconBellFilled } from '@tabler/icons-react'
import { Await } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'

type Props = {
  module: NotificationModule
}

export const NotificationsColumn = observer(function NotificationsColumn(props: Props) {
  const { module } = props
  const { feed } = module
  const user = useCurrentUser()
  const { delay } = useContext(DeckContext)
  useFeedSubscription(feed, module.contextWithFallback.context)
  return (
    <>
      <DeckColumnHeader id={module.id} settings={<NotificationSettings feed={feed} />}>
        <Stack gap={2}>
          <IconBellFilled />
          <Text variant='title' size='md'>
            Notification
          </Text>
        </Stack>
      </DeckColumnHeader>
      <Await promise={delay} fallback={<NotificationLoading rows={10} />}>
        {() => (
          <FeedList
            column
            feed={feed}
            onScrollEnd={feed.paginate}
            filter={(event) => user?.isEventMuted(event) || false}
            render={(event) => {
              const notification = module.feed.notifications.get(event.id)
              return notification && <NotificationItem notification={notification} />
            }}
            footer={<NotificationLoading rows={10} />}
          />
        )}
      </Await>
    </>
  )
})
