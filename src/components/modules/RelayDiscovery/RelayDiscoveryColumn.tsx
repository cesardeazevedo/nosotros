import type { RelayDiscoveryModule } from '@/hooks/modules/createRelayDiscoveryModule'
import { useRelayDiscoveryFeed } from '@/hooks/state/useRelayDiscoveryFeed'
import { DeckScroll } from '../Deck/DeckScroll'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { RelayDiscoveryHeader } from './RelayDiscoveryHeader'
import { RelayDiscoveryList } from './RelayDiscoveryList'
import { RelayDiscoveryTitle } from './RelayDiscoveryTitle'

type Props = {
  module: RelayDiscoveryModule
}

export const RelayDiscoveryColumn = (props: Props) => {
  const { module } = props
  const feed = useRelayDiscoveryFeed(module)
  return (
    <>
      <FeedHeaderBase
        feed={feed}
        leading={<RelayDiscoveryTitle feed={feed} />}
        customSettings={<RelayDiscoveryHeader renderTitle={false} feed={feed} />}
      />
      <DeckScroll>
        <RelayDiscoveryList feed={feed} />
      </DeckScroll>
    </>
  )
}
