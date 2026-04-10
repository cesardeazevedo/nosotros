import { NostrRouteParallel } from '@/components/modules/Nostr/NostrRouteParallel'
import { RouteUtilsContextProvider } from '@/components/providers/RouteUtilsProvider'
import { useMobile } from '@/hooks/useMobile'
import { useRelayAuthenticator } from '@/hooks/useRelayAuthenticator'
import { palette } from '@/themes/palette.stylex'
import { Outlet, useMatch, useSearch } from '@tanstack/react-router'
import { lazy, memo, Suspense } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { css, html } from 'react-strict-dom'
import { Header } from '../Header/Header'
import { BottomNavigation } from '../Navigation/BottomNavigation'
import { SidebarLayout } from '../Sidebar/SidebarLayout'
import { Toaster } from './Toaster'

// This components simulates parallel routing with the nostr route.
// So we don't have to unmount the feed when navigating to a nostr link.
// Making page transitions way much faster.
const OutletParallel = () => {
  const nostr = useSearch({ from: '__root__', select: (x) => x.nostr })
  const column = useSearch({ from: '__root__', select: (x) => x.column })
  const columnSize = useSearch({ from: '__root__', select: (x) => x.column_size })
  const notificationsRoute = useMatch({ from: '/notifications', shouldThrow: false })
  const homeRoute = useMatch({ from: '/feeds-layout/', shouldThrow: false })
  const homeRepliesRoute = useMatch({ from: '/feeds-layout/threads', shouldThrow: false })
  const feedRoute = useMatch({ from: '/feeds-layout/feed', shouldThrow: false })
  const feedsRoute = !!homeRoute || !!homeRepliesRoute || !!feedRoute
  const renderColumn = !!column && !notificationsRoute && !feedsRoute

  if (feedsRoute || notificationsRoute) {
    return (
      <RouteUtilsContextProvider value={{ hiddenRoute: false }}>
        <html.div style={styles.outlet}>
          <Outlet />
        </html.div>
      </RouteUtilsContextProvider>
    )
  }

  return (
    <>
      <Group
        orientation='horizontal'
        resizeTargetMinimumSize={{ coarse: 24, fine: 12 }}
        {...css.props([styles.group, nostr && !renderColumn ? styles.groupHidden : undefined])}
        id='hue'>
        <Panel
          defaultSize={renderColumn ? '50%' : '100%'}
          groupResizeBehavior={renderColumn ? 'preserve-pixel-size' : undefined}
          id='base'
          minSize={renderColumn ? '30%' : undefined}>
          <RouteUtilsContextProvider value={{ hiddenRoute: !!nostr && !renderColumn }}>
            <html.div style={[styles.outlet, !!nostr && !renderColumn && styles.hidden]}>
              <Outlet />
            </html.div>
          </RouteUtilsContextProvider>
        </Panel>
        {renderColumn ? <Separator {...css.props(styles.resizeHandle)} /> : null}
        {renderColumn ? (
          <Panel defaultSize={columnSize === 'sm' ? '50%' : '50%'} id='parallel' minSize='25%'>
            <html.div style={styles.column}>
              <NostrRouteParallel nostr={column} />
            </html.div>
          </Panel>
        ) : null}
      </Group>
      {!!nostr && !renderColumn ? <NostrRouteParallel nostr={nostr} /> : null}
    </>
  )
}

const Dialogs = lazy(async () => import('components/modules/DialogsModule').then((m) => ({ default: m.Dialogs })))

export const RootLayout = memo(function RootLayout() {
  const isMobile = useMobile()
  useRelayAuthenticator()

  return (
    <>
      <Suspense fallback={null}>
        <Dialogs />
      </Suspense>
      {!isMobile && (
        <SidebarLayout>
          <OutletParallel />
        </SidebarLayout>
      )}
      {isMobile && (
        <Header>
          <OutletParallel />
        </Header>
      )}
      <BottomNavigation />
      <Toaster />
    </>
  )
})

const styles = css.create({
  outlet: {
    width: '100%',
    minWidth: 0,
    height: '100%',
  },
  group: {
    width: '100%',
    height: '100%',
  },
  groupHidden: {
    display: 'none!important',
  },
  column: {
    width: '100%',
    minWidth: 0,
    height: '100%',
  },
  resizeHandle: {
    // width: 12,
    height: '100%',
    cursor: 'col-resize',
    borderLeft: '1px solid',
    borderLeftColor: palette.outlineVariant,
    ':hover': {
      borderLeftWidth: 2,
      borderLeftColor: palette.outline,
    },
  },
  hidden: {
    display: 'none',
  },
})
