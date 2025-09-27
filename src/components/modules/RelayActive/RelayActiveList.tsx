import { RelayListRow } from '@/components/elements/Relays/RelayListRow'
import { RelayListRowLoading } from '@/components/elements/Relays/RelayListRowLoading'
import { RelayLoadMore } from '@/components/elements/Relays/RelayLoadMore'
import { Stack } from '@/components/ui/Stack/Stack'
import { useActiveRelays } from '@/hooks/useRelays'
import { memo, useState } from 'react'

export const RelayActiveList = memo(function RelayActiveList() {
  const [pageSize, setPageSize] = useState(30)
  const relays = useActiveRelays()
  return (
    <>
      <Stack horizontal={false}>
        {relays.length === 0 ? (
          <RelayListRowLoading />
        ) : (
          relays.slice(0, pageSize).map((relay) => <RelayListRow key={relay.url} url={relay.url} />)
        )}
      </Stack>
      <RelayLoadMore total={relays.length} pageSize={pageSize} onClick={() => setPageSize((prev) => prev + 30)} />
    </>
  )
})
