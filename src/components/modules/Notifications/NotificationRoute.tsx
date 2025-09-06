import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { createNotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import { useNotificationFeedState } from '@/hooks/state/useNotificationFeed'
import { useResetScroll } from '@/hooks/useResetScroll'
import { notificationsRoute } from '@/Router'
import { NotificationFeed } from './NotificationFeed'
import { NotificationHeader } from './NotificationHeader'

export const NotificationRoute = function NotificationRoute() {
  useResetScroll()
  const { pubkey } = notificationsRoute.useRouteContext()
  const feed = useNotificationFeedState(createNotificationFeedModule(pubkey))
  return (
    <RouteContainer header={<NotificationHeader feed={feed} />}>
      <NotificationFeed feed={feed} />
    </RouteContainer>
  )
}
