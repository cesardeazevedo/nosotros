import type { RelayMonitorModule } from '@/hooks/modules/createRelayMonitorModule'
import { useRelayMonitorFeed } from '@/hooks/state/useRelayMonitorFeed'
import { DeckScroll } from '../Deck/DeckScroll'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
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
      <FeedHeaderBase feed={feed} leading={<RelayMonitorTitle feed={feed} />} />
      <DeckScroll>
        <RelayMonitorList feed={feed} />
      </DeckScroll>
    </>
  )
}
