import type { RelayDiscoveryModule } from '@/stores/modules/relay.discovery.module'
import { DeckColumnHeader } from '../Deck/DeckColumnHeader'
import { RelayDiscoveryTitle } from './RelayDiscoveryTitle'
import { RelayDiscoveryHeader } from './RelayDiscoveryHeader'
import { RelayDiscoveryList } from './RelayDiscoveryList'
import { DeckScroll } from '../Deck/DeckScroll'

type Props = {
  module: RelayDiscoveryModule
}

export const RelayDiscoveryColumn = (props: Props) => {
  const { module } = props
  return (
    <>
      <DeckColumnHeader id={module.id} leading={<RelayDiscoveryTitle module={module} />} >
        <RelayDiscoveryHeader renderTitle={false} module={module} />
      </DeckColumnHeader>
      <DeckScroll>
        <RelayDiscoveryList module={module} />
      </DeckScroll>
    </>
  )
}
