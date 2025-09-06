import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import { useNotificationFeedState } from '@/hooks/state/useNotificationFeed'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { NotificationFeed } from './NotificationFeed'
import { NotificationSettings } from './NotificationSettings'
import { memo } from 'react'

type Props = {
  module: NotificationFeedModule
}

export const NotificationColumn = memo(function NotificationColumn(props: Props) {
  const { module } = props
  const feed = useNotificationFeedState(module)
  return (
    <Stack horizontal={false}>
      <FeedHeaderBase label='Notifications' feed={feed} customSettings={<NotificationSettings feed={feed} />} />
      <Divider />
      <NotificationFeed column feed={feed} />
    </Stack>
  )
})
