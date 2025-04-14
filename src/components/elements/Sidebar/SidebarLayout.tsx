import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useCurrentPubkey, useGlobalSettings } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { useMatchRoute } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { LinkSignIn } from '../Links/LinkSignIn'
import { ProfilePopover } from '../Navigation/ProfilePopover'
import { Sidebar } from './Sidebar'
import { SidebarCollapsed } from './SidebarCollapsed'
import { SidebarTransition } from './SidebarTransition'

type Props = {
  children: React.ReactNode
}

export const SidebarLayout = observer(function SidebarLayout(props: Props) {
  const match = useMatchRoute()
  const global = useGlobalSettings()
  const isDeck = match({ to: '/deck/$id' })
  const ref = useRef<HTMLDivElement>(null)
  const pubkey = useCurrentPubkey()
  const isMobile = useMobile()
  return (
    <html.div style={styles.root}>
      {!isMobile && (
        <>
          <SidebarTransition open={!global.sidebarCollapsed}>
            {(sx, ref) => <Sidebar ref={ref} sx={sx} />}
          </SidebarTransition>
          <SidebarTransition open={global.sidebarCollapsed}>
            {(sx, ref) => <SidebarCollapsed ref={ref} sx={sx} />}
          </SidebarTransition>
        </>
      )}
      <html.main
        id='main_scroll'
        ref={ref}
        style={[
          styles.body,
          isDeck ? styles.body$deck : styles.body$nondeck,
          global.sidebarCollapsed && styles.body$collapsed,
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
    </html.div>
  )
})

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    overflow: 'hidden',
  },
  leading: {
    position: 'fixed',
    top: spacing.margin2,
    left: spacing.margin2,
  },
  trailing: {
    position: 'fixed',
    top: spacing.margin2,
    right: spacing.margin2,
  },
  body: {
    position: 'relative',
    flex: 1,
    overflow: 'auto',
  },
  body$collapsed: {
    paddingRight: 0,
  },
  body$nondeck: {
    paddingRight: {
      default: 315,
      '@media (max-width: 1920px)': 0,
    },
  },
  body$deck: {
    paddingTop: 0,
    paddingRight: 0,
  },
})
