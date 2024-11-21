import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { NotificationItem } from '@/components/elements/Notification/NotificationItem'
import { NotificationLoading } from '@/components/elements/Notification/NotificationLoading'
import { VirtualList } from '@/components/elements/VirtualLists/VirtualList'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NotificationModule } from '@/stores/modules/notification.module'
import { IconBellFilled } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'

type Props = {
  module: NotificationModule
}

export const NotificationsColumn = observer(function NotificationsColumns(props: Props) {
  const { module } = props
  const sub = useObservable(() => module.start())
  useSubscription(sub)
  return (
    <>
      <DeckColumnHeader id={module.id} name='Home Settings'>
        <Stack gap={2}>
          <IconBellFilled />
          <Text variant='title' size='md'>
            Notification
          </Text>
        </Stack>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none'>
        <VirtualList
          divider
          id={module.id}
          data={module.list}
          onScrollEnd={module.paginate}
          render={(notification) => <NotificationItem notification={notification} />}
          footer={<NotificationLoading rows={10} />}
        />
      </PaperContainer>
    </>
  )
})
