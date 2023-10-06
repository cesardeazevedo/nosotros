import { AppBar, Slide, Toolbar, useScrollTrigger } from '@mui/material'
import { useMobile } from 'hooks/useMobile'
import { ReactElement, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CenteredContainer } from '../Layouts/CenteredContainer'
import { Row } from '../Layouts/Flex'
import Sidebar from '../Navigation/Sidebar'
import Search from '../Search/Search'
import HeaderActions from './HeaderActions'
import HeaderCenter from './HeaderCenter'
import HeaderLogo from './HeaderLogo'

function HideOnScroll(props: { isMobile: boolean; children: ReactElement }) {
  const { isMobile, children } = props
  const trigger = useScrollTrigger({ target: window })

  if (!isMobile) {
    return children
  }

  return (
    <Slide appear={false} direction='down' in={!trigger}>
      {children}
    </Slide>
  )
}

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const isMobile = useMobile()

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  return (
    <HideOnScroll isMobile={isMobile}>
      <AppBar color='default' variant='outlined' elevation={0}>
        <Toolbar>
          <Row sx={{ justifyContent: 'space-between', width: '100%' }}>
            <Row
              sx={{
                position: 'absolute',
                width: isMobile ? '100%' : 'auto',
                display: !isHome && isMobile ? 'none' : 'flex',
              }}>
              {isMobile && <Sidebar />}
              <HeaderLogo />
            </Row>
            <CenteredContainer maxWidth='sm' sx={{ pt: 0, mt: 0 }}>
              {isHome ? !isMobile && <Search /> : <HeaderCenter onBack={handleBack} />}
            </CenteredContainer>
            {!isMobile && (
              <Row sx={{ position: 'absolute', right: 20 }}>
                <HeaderActions isHome={isHome} />
              </Row>
            )}
          </Row>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  )
}

export default Header
