import { RelayListRow } from '@/components/elements/Relays/RelayListRow'
import { RelayListRowLoading } from '@/components/elements/Relays/RelayListRowLoading'
import { Stack } from '@/components/ui/Stack/Stack'
import { useActiveRelays } from '@/hooks/useRelays'
import { memo } from 'react'

export const RelayActiveList = memo(function RelayActiveList() {
  const relays = useActiveRelays()
  return (
    <Stack horizontal={false}>
      {relays.length === 0 ? (
        <RelayListRowLoading />
      ) : (
        relays.map((relay) => <RelayListRow key={relay.url} url={relay.url} />)
      )}
    </Stack>
  )
})
