import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useResetScroll } from '@/hooks/useResetScroll'
import { css, html } from 'react-strict-dom'
import { RelayActiveHeader } from './RelayActiveHeader'
import { RelayActiveList } from './RelayActiveList'
import { RelayActiveTable } from './RelayActiveTable'

export const RelayActiveRoute = () => {
  useResetScroll()
  const isMobile = useMobile()
  return (
    <Stack horizontal={false} sx={styles.root}>
      <html.div style={styles.header}>
        <RelayActiveHeader />
      </html.div>
      <Divider />
      <html.section role='region' style={styles.body}>
        {isMobile ? <RelayActiveList /> : <RelayActiveTable />}
      </html.section>
    </Stack>
  )
}

const styles = css.create({
  root: {
    width: '100%',
    height: '100%',
    minHeight: 0,
  },
  header: {
    width: '100%',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
})
