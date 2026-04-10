import { createRelayMonitorModule } from '@/hooks/modules/createRelayMonitorModule'
import { type RelayMonitorFeed, useRelayMonitorFeed } from '@/hooks/state/useRelayMonitorFeed'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useResetScroll } from '@/hooks/useResetScroll'
import { useMemo } from 'react'
import { css, html } from 'react-strict-dom'
import { RelayMonitorHeader } from './RelayMonitorHeader'
import { RelayMonitorList } from './RelayMonitorList'
import { RelayMonitorTable } from './RelayMonitorTable'

type Props = {
  feed?: RelayMonitorFeed
}

const RelayMonitorScreen = (props: { feed: RelayMonitorFeed }) => {
  const { feed } = props
  useResetScroll()
  const isMobile = useMobile()
  return (
    <Stack horizontal={false} sx={styles.root}>
      <html.div style={styles.header}>
        <RelayMonitorHeader feed={feed} />
      </html.div>
      <Divider />
      <html.section role='region' style={styles.body}>
        {isMobile ? <RelayMonitorList feed={feed} /> : <RelayMonitorTable feed={feed} />}
      </html.section>
    </Stack>
  )
}

export const RelayMonitorRoute = (props: Props) => {
  if (props.feed) {
    return <RelayMonitorScreen feed={props.feed} />
  }

  return <RelayMonitorRouteInternal />
}

const RelayMonitorRouteInternal = () => {
  const module = useMemo(() => createRelayMonitorModule(), [])
  const feed = useRelayMonitorFeed(module)
  return <RelayMonitorScreen feed={feed} />
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
