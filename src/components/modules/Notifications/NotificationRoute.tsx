import { Stack } from '@/components/ui/Stack/Stack'
import { createNotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import { NostrRouteParallel } from '@/components/modules/Nostr/NostrRouteParallel'
import { useNotificationFeedState } from '@/hooks/state/useNotificationFeed'
import { useResetScroll } from '@/hooks/useResetScroll'
import { useMobile } from '@/hooks/useMobile'
import { notificationsRoute } from '@/Router'
import { palette } from '@/themes/palette.stylex'
import { useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { css, html } from 'react-strict-dom'
import { NotificationFeed } from './NotificationFeed'
import { NotificationHeader } from './NotificationHeader'

const DEFAULT_WIDTH = 400
const MIN_WIDTH = 400
const MAX_WIDTH = 550

export const NotificationRoute = function NotificationRoute() {
  useResetScroll()
  const column = useSearch({ from: '__root__', select: (x) => x.column })
  const isMobile = useMobile()
  const { pubkey } = notificationsRoute.useRouteContext()
  const module = useMemo(() => createNotificationFeedModule(pubkey), [pubkey])
  const feed = useNotificationFeedState(module)

  const content = (
    <Stack horizontal={false} sx={styles.root}>
      <html.div style={styles.header}>
        <NotificationHeader feed={feed} />
      </html.div>
      <html.section role='region' style={styles.body}>
        <NotificationFeed feed={feed} />
      </html.section>
    </Stack>
  )

  if (isMobile) {
    return content
  }

  return (
    <Group orientation='horizontal' resizeTargetMinimumSize={{ coarse: 24, fine: 12 }} style={panelStyles.columns}>
      <Panel
        defaultSize={DEFAULT_WIDTH}
        groupResizeBehavior='preserve-pixel-size'
        id='notifications-list'
        maxSize={MAX_WIDTH}
        minSize={MIN_WIDTH}>
        <html.div style={styles.leftColumn}>{content}</html.div>
      </Panel>
      <Separator {...css.props(styles.resizeHandle)} />
      <Panel defaultSize='72%' id='notifications-content' minSize='25%'>
        <html.div style={styles.mainColumn}>{column ? <NostrRouteParallel nostr={column} /> : null}</html.div>
      </Panel>
    </Group>
  )
}

const styles = css.create({
  root: {
    width: '100%',
    height: '100%',
    minHeight: 0,
  },
  header: {
    flexShrink: 0,
    width: '100%',
    borderBottom: '1px solid',
    borderBottomColor: palette.outlineVariant,
  },
  body: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  leftColumn: {
    width: '100%',
    minWidth: 0,
    height: '100%',
  },
  mainColumn: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    height: '100%',
  },
  resizeHandle: {
    height: '100%',
    cursor: 'col-resize',
    borderLeft: '1px solid',
    borderLeftColor: palette.outlineVariant,
    ':hover': {
      borderLeftWidth: 2,
      borderLeftColor: palette.outline,
    },
    ':focus-visible': {
      borderLeftWidth: 2,
      borderLeftColor: palette.outline,
    },
  },
})

const panelStyles = {
  columns: {
    width: '100%',
    height: '100%',
  } as const,
}
