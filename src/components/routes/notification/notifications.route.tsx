import { NotificationItem } from '@/components/elements/Notification/NotificationItem'
import { NotificationLoading } from '@/components/elements/Notification/NotificationLoading'
import { NotificationSettings } from '@/components/elements/Notification/NotificationSettings'
import { VirtualListWindow } from '@/components/elements/VirtualLists/VirtualListWindow'
import { Button } from '@/components/ui/Button/Button'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { useCurrentUser } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useLoaderData } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { css } from 'react-strict-dom'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'
import { Divider } from '../../ui/Divider/Divider'
import { Stack } from '../../ui/Stack/Stack'
import { Text } from '../../ui/Text/Text'

export const NotificationsRoute = observer(function NotificationRoute() {
  const { id, feed } = useLoaderData({ from: '/notifications' })
  const [expanded, setExpanded] = useState(false)
  const user = useCurrentUser()
  return (
    <CenteredContainer margin>
      <PaperContainer elevation={1}>
        <Stack gap={1} horizontal sx={styles.header} justify='space-between'>
          <Text variant='headline' size='sm'>
            Notifications
          </Text>
          <Button variant='filledTonal' onClick={() => setExpanded((prev) => !prev)}>
            <Stack gap={0.5}>
              {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              Settings
            </Stack>
          </Button>
        </Stack>
        <Expandable expanded={expanded}>
          <NotificationSettings feed={feed} />
        </Expandable>
        <Divider />
        <Stack horizontal={false}>
          <VirtualListWindow
            id={id}
            feed={feed}
            onScrollEnd={() => feed.paginate()}
            filter={(event) => (!feed.muted ? user?.isEventMuted(event) || false : true)}
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
