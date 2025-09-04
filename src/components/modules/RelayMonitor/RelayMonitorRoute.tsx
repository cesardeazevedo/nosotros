import { createRelayMonitorModule } from '@/hooks/modules/createRelayMonitorModule'
import { useRelayMonitorFeed } from '@/hooks/state/useRelayMonitorFeed'
import { useMobile } from '@/hooks/useMobile'
import { useResetScroll } from '@/hooks/useResetScroll'
import { useMemo } from 'react'
import { RelayMonitorList } from './RelayMonitorList'
import { RelayMonitorTable } from './RelayMonitorTable'
import { RelayMonitorSelect } from './RelayMonitorSelect'

export const RelayMonitorRoute = () => {
  useResetScroll()
  const isMobile = useMobile()
  const module = useMemo(() => createRelayMonitorModule(), [])
  const feed = useRelayMonitorFeed(module)
  return (
    <>
      <RelayMonitorSelect feed={feed} />
      {isMobile ? <RelayMonitorList feed={feed} /> : <RelayMonitorTable feed={feed} />}
    </>
  )
}
