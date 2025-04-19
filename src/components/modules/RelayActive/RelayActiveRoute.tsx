import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { RelayActiveHeader } from '@/components/modules/RelayActive/RelayActiveHeader'
import { useMobile } from '@/hooks/useMobile'
import { RelayActiveList } from './RelayActiveList'
import { RelayActiveTable } from './RelayActiveTable'

export const RelayActiveRoute = () => {
  const isMobile = useMobile()
  return (
    <RouteContainer maxWidth='lg' header={<RelayActiveHeader />}>
      {isMobile ? <RelayActiveList /> : <RelayActiveTable />}
    </RouteContainer>
  )
}
