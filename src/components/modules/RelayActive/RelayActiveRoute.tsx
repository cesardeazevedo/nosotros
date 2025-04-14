import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { RelayActiveHeader } from '@/components/modules/RelayActive/RelayActiveHeader'
import { RelayActiveList } from './RelayActiveList'

export const RelayActiveRoute = () => {
  return (
    <RouteContainer maxWidth='lg' header={<RelayActiveHeader />}>
      <RelayActiveList />
    </RouteContainer>
  )
}
