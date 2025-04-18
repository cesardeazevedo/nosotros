import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { useResetScroll } from '@/hooks/useResetScroll'
import { notificationsRoute } from '@/Router'
import { NotificationFeed } from './NotificationFeed'
import { NotificationHeader } from './NotificationHeader'

export const NotificationRoute = function NotificationRoute() {
  const module = notificationsRoute.useLoaderData()
  useResetScroll()
  return (
    <RouteContainer header={<NotificationHeader module={module} />}>
      <NotificationFeed feed={module.feed} />
    </RouteContainer>
  )
}
