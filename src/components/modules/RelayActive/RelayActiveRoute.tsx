import { useMobile } from '@/hooks/useMobile'
import { useResetScroll } from '@/hooks/useResetScroll'
import { RelayActiveList } from './RelayActiveList'
import { RelayActiveTable } from './RelayActiveTable'

export const RelayActiveRoute = () => {
  useResetScroll()
  const isMobile = useMobile()
  return <>{isMobile ? <RelayActiveList /> : <RelayActiveTable />}</>
}
