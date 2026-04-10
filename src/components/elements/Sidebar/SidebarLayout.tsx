import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useSettings } from '@/hooks/useSettings'
import { spacing } from '@/themes/spacing.stylex'
import { useMatch } from '@tanstack/react-router'
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
import { SidebarPaneNotifications } from './panes/SidebarPaneNotifications'

type Props = {
  children: React.ReactNode
}

export const SidebarLayout = memo(function SidebarLayout(props: Props) {
  const settings = useSettings()
  const isDeck = useMatch({ from: '/deck/$id', shouldThrow: false })
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
          <html.div
            style={[styles.leading, settings.sidebarCollapsed && styles.leading$collapsed]}
            id='header_lead'></html.div>
          <html.div style={styles.trailing}>
            <Stack gap={1}>
              {pubkey ? (
                <Stack gap={2}>
                  {!isDeck && (
                    <LinkBase to='.' search={(rest) => ({ ...rest, compose: true })}>
                      <Button variant='filled'>Create note</Button>
                    </LinkBase>
                  )}
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
    top: 0,
    marginLeft: spacing.margin1,
  },
  leading$collapsed: {
    marginLeft: 90,
  },
  trailing: {
    position: 'fixed',
    top: spacing.margin2,
    right: spacing.margin2,
    zIndex: 1,
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
