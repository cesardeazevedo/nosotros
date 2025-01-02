import { NotificationItem } from '@/components/elements/Notification/NotificationItem'
import { NotificationLoading } from '@/components/elements/Notification/NotificationLoading'
import { VirtualListWindow } from '@/components/elements/VirtualLists/VirtualListWindow'
import type { Notification } from '@/stores/notifications/notification'
import { spacing } from '@/themes/spacing.stylex'
import { useLoaderData } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'
import { Divider } from '../../ui/Divider/Divider'
import { Stack } from '../../ui/Stack/Stack'
import { Text } from '../../ui/Text/Text'

export const NotificationsRoute = observer(function ProfileRoute() {
  const { id, feed } = useLoaderData({ from: '/notifications' })
  return (
    <CenteredContainer margin>
      <PaperContainer elevation={1} sx={styles.paper}>
        <Stack gap={1} horizontal sx={styles.header} justify='space-between'>
          <Text variant='headline' size='sm'>
            Notifications
          </Text>
          {/* <NotificationFilters /> */}
        </Stack>
        <Divider />
        <Stack horizontal={false} sx={styles.content}>
          <VirtualListWindow
            id={id}
            feed={feed}
            onScrollEnd={() => feed.paginate()}
            render={(item) => <NotificationItem item={item as Notification} />}
          />
          <NotificationLoading rows={8} />
        </Stack>
      </PaperContainer>
    </CenteredContainer>
  )
})

const styles = css.create({
  paper: {},
  header: {
    padding: spacing.padding2,
  },
  content: {},
})
