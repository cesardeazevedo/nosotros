import { RelayListRowLoading } from '@/components/elements/Relays/RelayListRowLoading'
import { RelayLoadMore } from '@/components/elements/Relays/RelayLoadMore'
import { Stack } from '@/components/ui/Stack/Stack'
import type { RelayDiscoveryFeed } from '@/hooks/state/useRelayMonitorFeed'
import { memo, useMemo } from 'react'
import { RelayMonitorRow } from './RelayMonitorRow'

type Props = {
  feed: RelayDiscoveryFeed
}

export const RelayMonitorList = memo(function RelayMonitorList(props: Props) {
  const { feed } = props
  const list = useMemo(() => feed.list.slice(0, feed.pageSize) || [], [feed.list, feed.pageSize])
  return (
    <>
      <Stack horizontal={false}>
        {feed.list.length === 0 ? (
          <RelayListRowLoading />
        ) : (
          list.map((event) => <RelayMonitorRow table={false} key={event.id} event={event} />)
        )}
        <RelayLoadMore total={feed.list.length} pageSize={feed.pageSize} onClick={() => feed.paginate()} />
      </Stack>
    </>
  )
})
