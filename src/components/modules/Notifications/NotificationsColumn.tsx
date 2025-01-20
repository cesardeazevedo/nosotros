import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { NotificationItem } from '@/components/elements/Notification/NotificationItem'
import { NotificationLoading } from '@/components/elements/Notification/NotificationLoading'
import { NotificationSettings } from '@/components/elements/Notification/NotificationSettings'
import { VirtualListColumn } from '@/components/elements/VirtualLists/VirtualListColumn'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentUser } from '@/hooks/useRootStore'
import type { NotificationModule } from '@/stores/notifications/notification.module'
import { IconBellFilled, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'

type Props = {
  module: NotificationModule
}

export const NotificationsColumn = observer(function NotificationsColumn(props: Props) {
  const { module } = props
  const { id, feed } = module
  const user = useCurrentUser()
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
        <VirtualListColumn
          id={id}
          feed={feed}
          onScrollEnd={feed.paginate}
          filter={(event) => user?.isEventMuted(event) || false}
          render={(event) => {
            const notification = module.feed.notifications.get(event.id)
            return notification && <NotificationItem notification={notification} />
          }}
          footer={<NotificationLoading rows={10} />}
        />
      </PaperContainer>
    </>
  )
})
