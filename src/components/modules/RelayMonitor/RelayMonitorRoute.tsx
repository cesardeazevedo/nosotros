import { createRelayMonitorModule } from '@/hooks/modules/createRelayMonitorModule'
import { useRelayMonitorFeed } from '@/hooks/state/useRelayMonitorFeed'
import { useMobile } from '@/hooks/useMobile'
import { useResetScroll } from '@/hooks/useResetScroll'
import { useMemo } from 'react'
import { RelayMonitorList } from './RelayMonitorList'
import { RelayMonitorTable } from './RelayMonitorTable'

export const RelayMonitorRoute = () => {
  useResetScroll()
  const isMobile = useMobile()
  const module = useMemo(() => createRelayMonitorModule(), [])
  const feed = useRelayMonitorFeed(module)
  return <>{isMobile ? <RelayMonitorList feed={feed} /> : <RelayMonitorTable feed={feed} />}</>
}
