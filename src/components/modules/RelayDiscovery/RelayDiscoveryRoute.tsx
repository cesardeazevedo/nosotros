import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { createRelayDiscoveryModule } from '@/hooks/modules/createRelayDiscoveryModule'
import { useRelayDiscoveryFeed } from '@/hooks/state/useRelayDiscoveryFeed'
import { useMobile } from '@/hooks/useMobile'
import { useResetScroll } from '@/hooks/useResetScroll'
import { RelayDiscoveryHeader } from './RelayDiscoveryHeader'
import { RelayDiscoveryList } from './RelayDiscoveryList'
import { RelayDiscoveryTable } from './RelayDiscoveryTable'

export const RelayDiscoveryRoute = () => {
  useResetScroll()
  const isMobile = useMobile()
  const feed = useRelayDiscoveryFeed(createRelayDiscoveryModule())
  return (
    <RouteContainer maxWidth='lg' header={<RelayDiscoveryHeader feed={feed} />}>
      {isMobile ? <RelayDiscoveryList feed={feed} /> : <RelayDiscoveryTable feed={feed} />}
    </RouteContainer>
  )
}
