import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { DeckContext } from '@/components/elements/Deck/DeckContext'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { List } from '@/components/elements/List/List'
import { NotificationItem } from '@/components/elements/Notification/NotificationItem'
import { NotificationLoading } from '@/components/elements/Notification/NotificationLoading'
import { NotificationSettings } from '@/components/elements/Notification/NotificationSettings'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import { useCurrentUser } from '@/hooks/useRootStore'
import type { NotificationModule } from '@/stores/notifications/notification.module'
import { IconBellFilled, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
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
  useFeedSubscription(feed, module.contextWithFallback.client)
  return (
    <>
      <DeckColumnHeader
        id={module.id}
        settingsIcon={({ expanded, expand }) => (
          <Button variant='filledTonal' onClick={() => expand(!expanded)}>
            <Stack gap={0.5}>
              {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              Settings
            </Stack>
          </Button>
        )}
        settings={<NotificationSettings feed={feed} />}>
        <Stack gap={2}>
          <IconBellFilled />
          <Text variant='title' size='md'>
            Notification
          </Text>
        </Stack>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none'>
        <Await promise={delay} fallback={<NotificationLoading rows={10} />}>
          {() => (
            <List
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
      </PaperContainer>
    </>
  )
})
