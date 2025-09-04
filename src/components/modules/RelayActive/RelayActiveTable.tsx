import { RelayLoadMore } from '@/components/elements/Relays/RelayLoadMore'
import { RelayTableHeader } from '@/components/elements/Relays/RelayTableHeader'
import { RelayTableRow } from '@/components/elements/Relays/RelayTableRow'
import { Stack } from '@/components/ui/Stack/Stack'
import { useActiveRelays } from '@/hooks/useRelays'
import { memo, useState } from 'react'
import { RelayTableRowLoading } from '../../elements/Relays/RelayTableRowLoading'

export const RelayActiveTable = memo(function RelayActiveTable() {
  const [pageSize, setPageSize] = useState(30)
  const relays = useActiveRelays()
  return (
    <Stack horizontal={false}>
      {relays.length === 0 ? (
        <RelayTableRowLoading />
      ) : (
        <table cellPadding={1}>
          <RelayTableHeader renderLatencyColumn={false} />
          <tbody>
            {relays.slice(0, pageSize).map((relay) => (
              <RelayTableRow key={relay.url} relay={relay.url} />
            ))}
          </tbody>
        </table>
      )}
      <RelayLoadMore total={relays.length} pageSize={pageSize} onClick={() => setPageSize((prev) => prev + 30)} />
    </Stack>
  )
})
