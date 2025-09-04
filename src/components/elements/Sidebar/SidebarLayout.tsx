import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useSettings } from '@/hooks/useSettings'
import { spacing } from '@/themes/spacing.stylex'
import { useMatchRoute } from '@tanstack/react-router'
import React, { memo, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { LinkBase } from '../Links/LinkBase'
import { LinkSignIn } from '../Links/LinkSignIn'
import { ProfilePopover } from '../Navigation/ProfilePopover'
import { Sidebar } from './Sidebar'
import { SidebarCollapsed } from './SidebarCollapsed'
import type { Panes } from './SidebarContext'
import { SidebarContext } from './SidebarContext'
import { SidebarTransition } from './SidebarTransition'
import { SidebarPaneLists } from './panes/SidebarPaneLists'
import { SidebarPaneNotifications } from './panes/SidebarPaneNotifications'

type Props = {
  children: React.ReactNode
}

export const SidebarLayout = memo(function SidebarLayout(props: Props) {
  'use no memo' // causing issue with useMatchRoute not updating https://github.com/TanStack/router/issues/4499
  const match = useMatchRoute()
  const settings = useSettings()
  const isDeck = match({ to: '/deck/$id' })
  const pubkey = useCurrentPubkey()
  const [pane, setPane] = useState<Panes>(false)
  const sidebarCollapsed = settings.sidebarCollapsed || pane !== false
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
        {pubkey && (
          <SidebarTransition open={pane === '/notifications'}>
            {(sx, ref) => <SidebarPaneNotifications ref={ref} sx={sx} pubkey={pubkey} />}
          </SidebarTransition>
        )}
        <html.main
          style={[
            !isDeck && !settings.sidebarCollapsed && styles.main,
            isDeck && styles.main$deck,
            isDeck && !settings.sidebarCollapsed && styles.main$deck$expanded,
          ]}>
          <html.div style={styles.leading} id='header_lead'></html.div>
          <html.div style={styles.trailing}>
            <Stack gap={1}>
              {pubkey ? (
                <Stack gap={2}>
                  <LinkBase to='.' search={(rest) => ({ ...rest, compose: true })}>
                    <Button variant='filled'>Create note</Button>
                  </LinkBase>
                  <ProfilePopover />
                </Stack>
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
  leading: {
    position: 'fixed',
    // top: spacing.margin2,
    marginLeft: spacing.margin1,
  },
  trailing: {
    position: 'fixed',
    top: spacing.margin2,
    right: spacing.margin2,
  },
  main: {
    overflowX: 'hidden',
    marginLeft: 315,
    paddingRight: {
      default: 315,
      '@media (max-width: 1920px)': 0,
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
  main$deck$expanded: {
    marginLeft: 315,
  },
})
