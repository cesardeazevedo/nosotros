import { FeedList } from '@/components/elements/Feed/FeedList'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { NotificationItem } from '@/components/elements/Notification/NotificationItem'
import { NotificationLoading } from '@/components/elements/Notification/NotificationLoading'
import { NotificationSettings } from '@/components/elements/Notification/NotificationSettings'
import { useNotificationModule } from '@/components/modules/Notifications/useNotificationModule'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import { useCurrentUser } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  pubkey: string
}

export const NotificationsRoute = observer(function NotificationRoute(props: Props) {
  const module = useNotificationModule(props.pubkey)
  const [expanded, setExpanded] = useState(false)
  const feed = module.feed
  useFeedSubscription(feed, module.contextWithFallback.context)
  const lastSeen = useMemo(() => module.feed.lastSeen, [])
  const user = useCurrentUser()
  return (
    <CenteredContainer margin>
      <PaperContainer>
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
          <FeedList
            feed={feed}
            onScrollEnd={() => feed.paginate()}
            filter={(event) => (!feed.muted ? user?.isEventMuted(event) || false : true)}
            render={(event) => {
              const notification = feed.notifications.get(event.id)
              return notification && <NotificationItem lastSeen={lastSeen} notification={notification} />
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
