import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { NotificationLoading } from './NotificationLoading'

export const NotificationPending = () => {
  return (
    <RouteContainer>
      <NotificationLoading rows={8} />
    </RouteContainer>
  )
}
