import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import { useNotificationFeedState } from '@/hooks/state/useNotificationFeed'
import { memo } from 'react'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { NotificationFeed } from './NotificationFeed'
import { NotificationSettings } from './NotificationSettings'

type Props = {
  module: NotificationFeedModule
}

export const NotificationColumn = memo(function NotificationColumn(props: Props) {
  const { module } = props
  const feed = useNotificationFeedState(module)
  return (
    <div>
      <Stack horizontal={false}>
        <FeedHeaderBase
          label='Notifications'
          feed={feed}
          customSettings={({ close }) => <NotificationSettings feed={feed} onClose={close} />}
        />
        <Divider />
        <NotificationFeed column feed={feed} />
      </Stack>
    </div>
  )
})
