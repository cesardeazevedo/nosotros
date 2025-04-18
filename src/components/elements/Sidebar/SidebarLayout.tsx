import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentPubkey, useGlobalSettings } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { useMatchRoute } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { css, html } from 'react-strict-dom'
import { LinkSignIn } from '../Links/LinkSignIn'
import { ProfilePopover } from '../Navigation/ProfilePopover'
import { Sidebar } from './Sidebar'
import { SidebarCollapsed } from './SidebarCollapsed'
import type { Panes } from './SidebarContext'
import { SidebarContext } from './SidebarContext'
import { SidebarTransition } from './SidebarTransition'
import { SidebarPaneLists } from './panes/SidebarPaneLists'
import { SidebarPaneNotifications } from './panes/SidebarPaneNotifications'
import { SidebarPaneRelayDiscovery } from './panes/SidebarPaneRelayDiscovery'

type Props = {
  children: React.ReactNode
}

export const SidebarLayout = observer(function SidebarLayout(props: Props) {
  const match = useMatchRoute()
  const global = useGlobalSettings()
  const isDeck = match({ to: '/deck/$id' })
  const pubkey = useCurrentPubkey()
  const [pane, setPane] = useState<Panes>(false)
  const sidebarCollapsed = global.sidebarCollapsed || pane !== false
  return (
    <SidebarContext.Provider
      value={{
        pane,
        setPane: (pane) => setPane((prev) => (prev === pane ? false : pane)),
        renderCollapsedButton: true,
      }}>
      <>
        <SidebarTransition open={!sidebarCollapsed}>{(sx, ref) => <Sidebar ref={ref} sx={sx} />}</SidebarTransition>
        <SidebarTransition open={sidebarCollapsed}>
          {(sx, ref) => <SidebarCollapsed ref={ref} sx={sx} />}
        </SidebarTransition>
        <SidebarTransition open={pane === '/lists'}>
          {(sx, ref) => <SidebarPaneLists ref={ref} sx={sx} />}
        </SidebarTransition>
        <SidebarTransition open={pane === '/notifications'}>
          {(sx, ref) => <SidebarPaneNotifications ref={ref} sx={sx} />}
        </SidebarTransition>
        <SidebarTransition open={pane === '/explore/relays'}>
          {(sx, ref) => <SidebarPaneRelayDiscovery ref={ref} sx={sx} />}
        </SidebarTransition>
        <html.main
          style={[
            !isDeck && (!global.sidebarCollapsed ? styles.main : styles.main$sidebar$collapsed),
            isDeck && styles.main$deck,
            isDeck && !global.sidebarCollapsed && styles.main$deck$expanded,
          ]}>
          <html.div style={styles.trailing}>
            <Stack gap={1}>
              {pubkey ? (
                <ProfilePopover />
              ) : (
                <LinkSignIn>
                  <Button variant='filled'>Sign In</Button>
                </LinkSignIn>
              )}
            </Stack>
          </html.div>
          {props.children}
        </html.main>
      </>
    </SidebarContext.Provider>
  )
})

const styles = css.create({
  trailing: {
    position: 'fixed',
    top: spacing.margin2,
    right: spacing.margin2,
  },
  main: {
    overflowX: 'hidden',
    paddingLeft: {
      default: 0,
      '@media (max-width: 1920px)': 315,
    },
  },
  main$deck: {
    position: 'static',
    overflowX: 'auto',
    overflowY: 'hidden',
    width: 'fit-content',
    height: '100%',
    marginLeft: 84,
  },
  main$sidebar$collapsed: {
    marginLeft: 84,
  },
  main$deck$expanded: {
    marginLeft: 315,
  },
})
