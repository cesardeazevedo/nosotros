import { RelayLoadMore } from '@/components/elements/Relays/RelayLoadMore'
import { RelayTableHeader } from '@/components/elements/Relays/RelayTableHeader'
import { RelayTableRowLoading } from '@/components/elements/Relays/RelayTableRowLoading'
import { Stack } from '@/components/ui/Stack/Stack'
import type { RelayMonitorFeed } from '@/hooks/state/useRelayMonitorFeed'
import { memo, useMemo } from 'react'
import { RelayMonitorRow } from './RelayMonitorRow'

type Props = {
  feed: RelayMonitorFeed
}

export const RelayMonitorTable = memo(function RelayMonitorTable(props: Props) {
  const { feed } = props
  const list = useMemo(() => feed.list.slice(0, feed.pageSize) || [], [feed.list, feed.pageSize])
  return (
    <Stack horizontal={false}>
      {list.length === 0 ? (
        <RelayTableRowLoading />
      ) : (
        <table cellPadding={1}>
          <RelayTableHeader />
          <tbody>
            {list.map((event) => (
              <RelayMonitorRow key={event.id} event={event} />
            ))}
          </tbody>
        </table>
      )}
      <RelayLoadMore total={feed.list.length} pageSize={feed.pageSize} onClick={() => feed.paginate()} />
    </Stack>
  )
})
