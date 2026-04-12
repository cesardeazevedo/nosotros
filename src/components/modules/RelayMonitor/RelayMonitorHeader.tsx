import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import type { RelayMonitorFeed } from '@/hooks/state/useRelayMonitorFeed'
import { memo } from 'react'

type Props = {
  feed: RelayMonitorFeed
}

export const RelayMonitorHeader = memo(function RelayMonitorHeader(props: Props) {
  const { feed } = props
  return <HeaderBase leading={`Relay Discovery (${feed.getTotal()})`} />
})
