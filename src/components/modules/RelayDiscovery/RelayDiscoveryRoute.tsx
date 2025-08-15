import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { RelayDiscoveryHeader } from './RelayDiscoveryHeader'
import { useMobile } from '@/hooks/useMobile'
import { useResetScroll } from '@/hooks/useResetScroll'
import { RelayDiscoveryList } from './RelayDiscoveryList'
import { RelayDiscoveryTable } from './RelayDiscoveryTable'
import { useRelayDiscoveryFeed } from '@/hooks/state/useRelayDiscoveryFeed'
import { createRelayDiscoveryModule } from '@/hooks/modules/createRelayDiscoveryModule'

export const RelayDiscoveryRoute = () => {
  const isMobile = useMobile()
  const feed = useRelayDiscoveryFeed(createRelayDiscoveryModule())
  useResetScroll()
  return (
    <RouteContainer maxWidth='lg' header={<RelayDiscoveryHeader feed={feed} />}>
      {isMobile ? <RelayDiscoveryList feed={feed} /> : <RelayDiscoveryTable feed={feed} />}
    </RouteContainer>
  )
}
