import type { FeedModule } from '@/stores/modules/feed.module'
import { IconBellFilled } from '@tabler/icons-react'
import { DeckColumnHeader } from '../Deck/DeckColumnHeader'
import { DeckScroll } from '../Deck/DeckScroll'
import { NotificationFeed } from './NotificationFeed'
import { NotificationSettings } from './NotificationSettings'

type Props = {
  module: FeedModule
}

export const NotificationColumn = (props: Props) => {
  const { module } = props
  return (
    <>
      <DeckColumnHeader id={module.id} label='Notifications' icon={<IconBellFilled />}>
        <NotificationSettings module={module} />
      </DeckColumnHeader>
      <DeckScroll>
        <NotificationFeed column feed={module.feed} />
      </DeckScroll>
    </>
  )
}
