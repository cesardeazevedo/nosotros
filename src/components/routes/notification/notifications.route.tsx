import { NotificationItem } from '@/components/elements/Notification/NotificationItem'
import { NotificationLoading } from '@/components/elements/Notification/NotificationLoading'
import { VirtualListWindow } from '@/components/elements/VirtualLists/VirtualListWindow'
import { spacing } from '@/themes/spacing.stylex'
import { useLoaderData } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'
import { Divider } from '../../ui/Divider/Divider'
import { Stack } from '../../ui/Stack/Stack'
import { Text } from '../../ui/Text/Text'

export const NotificationsRoute = observer(function NotificationRoute() {
  const { id, feed } = useLoaderData({ from: '/notifications' })
  return (
    <CenteredContainer margin>
      <PaperContainer elevation={1}>
        <Stack gap={1} horizontal sx={styles.header} justify='space-between'>
          <Text variant='headline' size='sm'>
            Notifications
          </Text>
          {/* <NotificationFilters /> */}
        </Stack>
        <Divider />
        <Stack horizontal={false}>
          <VirtualListWindow
            id={id}
            feed={feed}
            onScrollEnd={() => feed.paginate()}
            render={(event) => {
              const notification = feed.notifications.get(event.id)
              return notification && <NotificationItem notification={notification} />
            }}
          />
          <NotificationLoading rows={8} />
        </Stack>
      </PaperContainer>
    </CenteredContainer>
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding2,
  },
})
