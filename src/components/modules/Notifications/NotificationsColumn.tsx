import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { NotificationItem } from '@/components/elements/Notification/NotificationItem'
import { NotificationLoading } from '@/components/elements/Notification/NotificationLoading'
import { VirtualListColumn } from '@/components/elements/VirtualLists/VirtualListColumn'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NotificationModule } from '@/stores/notifications/notification.module'
import { IconBellFilled } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'

type Props = {
  module: NotificationModule
}

export const NotificationsColumn = observer(function NotificationsColumn(props: Props) {
  const { module } = props
  const { id, feed } = module
  return (
    <>
      <DeckColumnHeader id={module.id}>
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
          onScrollEnd={() => feed.paginate()}
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
