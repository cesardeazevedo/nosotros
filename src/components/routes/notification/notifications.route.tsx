import { NotificationItem } from '@/components/elements/Notification/NotificationItem'
import { NotificationLoading } from '@/components/elements/Notification/NotificationLoading'
import { VirtualListWindow } from '@/components/elements/VirtualLists/VirtualListWindow'
import { deckStore } from '@/stores/ui/deck.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'
import { Divider } from '../../ui/Divider/Divider'
import { Stack } from '../../ui/Stack/Stack'
import { Text } from '../../ui/Text/Text'
// import { NotificationFilters } from '@/components/elements/Notification/NotificationFilters'

export const NotificationsRoute = observer(function ProfileRoute() {
  const module = deckStore.notification
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
          {module && (
            <VirtualListWindow
              divider
              id={module.id}
              data={module.list}
              onScrollEnd={module.paginate}
              render={(notification) => <NotificationItem notification={notification} />}
            />
          )}
          <NotificationLoading />
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
