import { AppBar, Slide, Toolbar, useScrollTrigger, type SlideProps } from '@mui/material'
import { useMatch } from '@tanstack/react-router'
import { useMobile } from 'hooks/useMobile'
import { useCurrentRoute } from 'hooks/useNavigations'
import type { ReactElement } from 'react'
import { CenteredContainer } from '../Layouts/CenteredContainer'
import { Row } from '../Layouts/Flex'
import Sidebar from '../Navigation/Sidebar'
import HeaderActions from './HeaderActions'
import HeaderCenter from './HeaderCenter'
import HeaderLogo from './HeaderLogo'

export function HideOnScroll(props: {
  direction?: SlideProps['direction']
  isMobile: boolean
  children: ReactElement
}) {
  const { direction = 'down', isMobile, children } = props
  const trigger = useScrollTrigger({ target: window })

  if (!isMobile) {
    return children
  }

  return (
    <Slide appear={false} direction={direction} in={!trigger}>
      {children}
    </Slide>
  )
}

function Header() {
  const isMobile = useMobile()
  const route = useCurrentRoute()
  useMatch({ from: '__root__' })

  const isNostrRoute = route.routeId === '/$nostr'

  return (
    <HideOnScroll isMobile={isMobile}>
      <AppBar color='default' variant='outlined' elevation={0}>
        <Toolbar>
          <Row sx={{ justifyContent: 'space-between', width: '100%' }}>
            <Row
              sx={{
                position: 'absolute',
                width: isMobile ? '100%' : 'auto',
              }}>
              {!isNostrRoute && isMobile && <Sidebar />}
              {isNostrRoute && isMobile ? null : <HeaderLogo />}
            </Row>
            <CenteredContainer maxWidth='sm' sx={{ pt: 0, mt: 0 }}>
              <HeaderCenter />
            </CenteredContainer>
            {!isMobile && (
              <Row sx={{ position: 'absolute', right: 20 }}>
                <HeaderActions />
              </Row>
            )}
          </Row>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  )
}

export default Header
