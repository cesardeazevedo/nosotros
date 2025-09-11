import type { RelayMonitorModule } from '@/hooks/modules/createRelayMonitorModule'
import { useRelayMonitorFeed } from '@/hooks/state/useRelayMonitorFeed'
import { DeckScroll } from '../Deck/DeckScroll'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { RelayMonitorHeader } from './RelayMonitorHeader'
import { RelayMonitorList } from './RelayMonitorList'
import { RelayMonitorTitle } from './RelayMonitorTitle'

type Props = {
  module: RelayMonitorModule
}

export const RelayMonitorColumn = (props: Props) => {
  const { module } = props
  const feed = useRelayMonitorFeed(module)
  return (
    <>
      <FeedHeaderBase
        feed={feed}
        leading={<RelayMonitorTitle feed={feed} />}
        customSettings={<RelayMonitorHeader renderTitle={false} feed={feed} />}
      />
      <DeckScroll>
        <RelayMonitorList feed={feed} />
      </DeckScroll>
    </>
  )
}
