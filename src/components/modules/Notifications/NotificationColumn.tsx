import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedModule } from '@/stores/modules/feed.module'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { NotificationFeed } from './NotificationFeed'
import { NotificationSettings } from './NotificationSettings'

type Props = {
  module: FeedModule
}

export const NotificationColumn = (props: Props) => {
  const { module } = props
  return (
    <Stack horizontal={false}>
      <FeedHeaderBase
        label='Notifications'
        feed={module.feed}
        customSettings={<NotificationSettings module={module} />}
      />
      <Divider />
      <>
        <NotificationFeed column feed={module.feed} />
      </>
    </Stack>
  )
}
