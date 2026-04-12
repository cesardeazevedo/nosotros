import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { useActiveRelays, useConnectedRelays } from '@/hooks/useRelays'
import { memo } from 'react'

export const RelayActiveHeader = memo(function RelayActiveHeader() {
  const relays = useActiveRelays()
  const connected = useConnectedRelays()
  return (
    <HeaderBase leading={`Active Relays (${connected.length}/${relays.length})`} />
  )
})
