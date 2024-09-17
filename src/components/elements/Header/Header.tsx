import { AppBar } from '@/components/ui/AppBar/AppBar'
import type { Props as SlideProps } from '@/components/ui/Slide/Slide'
import Slide from '@/components/ui/Slide/Slide'
import { useScrollTrigger } from '@/hooks/useScrollTrigger'
import { spacing } from '@/themes/spacing.stylex'
import { useMatch } from '@tanstack/react-router'
import { useMobile } from 'hooks/useMobile'
import { useCurrentRoute } from 'hooks/useNavigations'
import React from 'react'
import { css, html } from 'react-strict-dom'
import { CenteredContainer } from '../Layouts/CenteredContainer'
import Sidebar from '../Navigation/Sidebar'
import HeaderActions from './HeaderActions'
import HeaderCenter from './HeaderCenter'
import HeaderLogo from './HeaderLogo'

export const HideOnScroll = React.memo(
  (props: { direction?: SlideProps['direction']; children: React.ReactElement }) => {
    const { direction = 'down', children } = props
    const trigger = useScrollTrigger({ target: window, threshold: 100, disableHysteresis: false })

    return (
      <Slide appear={false} direction={direction} in={!trigger}>
        {children}
      </Slide>
    )
  },
)

const Header = React.memo(function Header() {
  const isMobile = useMobile()
  const route = useCurrentRoute()
  useMatch({ from: '__root__' })

  const isNostrRoute = route.routeId.startsWith('/$nostr')

  const HideOnScrollContainer = isMobile ? HideOnScroll : React.Fragment

  return (
    <HideOnScrollContainer>
      <AppBar>
        <html.div style={styles.leading}>
          {!isNostrRoute && isMobile && <Sidebar />}
          {!isMobile && <HeaderLogo />}
        </html.div>
        <CenteredContainer sx={styles.content}>
          <HeaderCenter />
        </CenteredContainer>
        {!isMobile && (
          <html.div style={styles.trailing}>
            <HeaderActions />
          </html.div>
        )}
      </AppBar>
    </HideOnScrollContainer>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
  },
  leading: {
    position: 'absolute',
    left: spacing.margin3,
  },
  trailing: {
    position: 'absolute',
    right: spacing.margin3,
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
    marginTop: 0,
  },
  center: {
    position: 'absolute',
    width: '100%',
    margin: 'auto',
    alignSelf: 'center',
  },
  center$mobile: {
    width: '100%',
  },
})

export default Header
