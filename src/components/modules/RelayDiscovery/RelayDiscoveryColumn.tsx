import type { RelayDiscoveryModule } from '@/stores/modules/relay.discovery.module'
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
  return (
    <>
      <FeedHeaderBase
        feed={module.feed}
        leading={<RelayDiscoveryTitle module={module} />}
        customSettings={<RelayDiscoveryHeader renderTitle={false} module={module} />}
      />
      <DeckScroll>
        <RelayDiscoveryList module={module} />
      </DeckScroll>
    </>
  )
}
