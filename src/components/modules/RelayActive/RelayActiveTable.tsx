import { RelayTableHeader } from '@/components/elements/Relays/RelayTableHeader'
import { RelayTableRow } from '@/components/elements/Relays/RelayTableRow'
import { Stack } from '@/components/ui/Stack/Stack'
import { useActiveRelays } from '@/hooks/useRelays'
import { memo } from 'react'
import { RelayTableRowLoading } from '../../elements/Relays/RelayTableRowLoading'

export const RelayActiveTable = memo(function RelayActiveTable() {
  const relays = useActiveRelays()
  return (
    <Stack horizontal={false}>
      {relays.length === 0 && <RelayTableRowLoading />}
      <table cellPadding={1}>
        <RelayTableHeader renderLatencyColumn={false} />
        <tbody>
          {relays.map((relay) => (
            <RelayTableRow key={relay.url} relay={relay.url} />
          ))}
        </tbody>
      </table>
      <br />
    </Stack>
  )
})
