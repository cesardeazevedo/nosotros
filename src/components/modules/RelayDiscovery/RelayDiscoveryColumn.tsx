import type { RelayDiscoveryModule } from '@/stores/modules/relay.discovery.module'
import { DeckColumnHeader } from '../Deck/DeckColumnHeader'
import { Feed } from '../Feed/Feed'
import { RelayDiscoveryRow } from './RelayDiscoveryRow'
import { RelayDiscoveryRowLoading } from './RelayDiscoveryRowLoading'
import { RelayDiscoveryTitle } from './RelayDiscoveryTitle'

type Props = {
  module: RelayDiscoveryModule
}

export const RelayDiscoveryColumn = (props: Props) => {
  const { module } = props
  return (
    <>
      <DeckColumnHeader id={module.id} leading={<RelayDiscoveryTitle module={module} />} />
      <Feed
        column
        feed={module.feed}
        loading={<RelayDiscoveryRowLoading />}
        render={(event) => <RelayDiscoveryRow key={event.id} table={false} event={event} />}
      />
    </>
  )
}
