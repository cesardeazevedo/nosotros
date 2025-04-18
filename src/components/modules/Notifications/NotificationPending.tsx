import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { NotificationHeader } from './NotificationHeader'
import { NotificationLoading } from './NotificationLoading'

export const NotificationPending = () => {
  return (
    <RouteContainer header={<NotificationHeader />}>
      <NotificationLoading rows={8} />
    </RouteContainer>
  )
}
