import { AppBar } from '@/components/ui/AppBar/AppBar'
import { spacing } from '@/themes/spacing.stylex'
import { useMatch } from '@tanstack/react-router'
import { useNostrRoute } from 'hooks/useNavigations'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { NavigationHeader } from '../Navigation/NavigationHeader'
import { SidebarDrawer } from '../Sidebar/SidebarDrawer'
import { HeaderLogo } from './HeaderLogo'

type Props = {
  children: React.ReactNode
}

export const Header = memo(function Header(props: Props) {
  useMatch({ from: '__root__' })

  const isNostrRoute = !!useNostrRoute()

  return (
    <>
      <AppBar sx={styles.root}>
        {!isNostrRoute && <SidebarDrawer sx={styles.drawerButton} />}
        {!isNostrRoute && <HeaderLogo />}
        {isNostrRoute && <NavigationHeader />}
      </AppBar>
      <html.div style={styles.body}>{props.children}</html.div>
    </>
  )
})

const styles = css.create({
  root: {
    justifyContent: 'center',
  },
  body: {
    marginTop: 64,
  },
  drawerButton: {
    position: 'absolute',
    top: spacing.margin2,
    left: spacing.margin3,
  },
})
