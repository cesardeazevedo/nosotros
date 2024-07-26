import { Badge, BottomNavigationAction, Box, BottomNavigation as MuiBottomNavigation, styled } from '@mui/material'
import { IconBell, IconHome, IconMessageCircle, IconServerBolt, IconUser } from '@tabler/icons-react'
import { useMatch, useRouter } from '@tanstack/react-router'
import { useNostrRoute } from 'hooks/useNavigations'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { authStore } from 'stores/ui/auth.store'
import { HideOnScroll } from '../Header/Header'
import LinkProfile from '../Links/LinkProfile'
import LinkSignIn from '../Links/LinkSignIn'

const Container = styled(Box)(({ theme }) =>
  theme.unstable_sx({
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    height: 'min(80px, calc(56px + var(--sab)))',
    display: { md: 'none' },
    backgroundColor: `rgba(${theme.palette.common.backgroundChannel} / 0.66)`,
    backdropFilter: 'blur(4px)',
  }),
)

const BottomNavigation = observer(function BottomNavigation() {
  const { currentUser } = authStore
  const router = useRouter()
  useMatch({ from: '__root__' })
  const nostrRoute = useNostrRoute()

  // TODO: This needs better inference
  let context
  if (nostrRoute?.context && 'decoded' in nostrRoute.context) {
    context = nostrRoute.context
  }

  const handleHome = useCallback(() => {
    router.navigate({ to: '/' })
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }, [router])

  return (
    <HideOnScroll isMobile direction='up'>
      <Container>
        <MuiBottomNavigation
          showLabels={false}
          value={context?.id === authStore.pubkey ? 'profile' : 'feed'}
          sx={{ backgroundColor: 'transparent' }}>
          <BottomNavigationAction
            value='messages'
            onClick={handleHome}
            icon={
              <Badge badgeContent={0} color='primary'>
                <IconHome size={28} strokeWidth='1.5' />
              </Badge>
            }
          />
          <BottomNavigationAction
            disabled
            sx={{ opacity: 0.4 }}
            value='messages'
            icon={<IconMessageCircle size={28} strokeWidth='1.5' />}
          />
          <BottomNavigationAction
            disabled
            sx={{ opacity: 0.5 }}
            value='relays'
            icon={<IconServerBolt size={28} strokeWidth='1.5' />}
          />
          <BottomNavigationAction
            disabled
            sx={{ opacity: 0.5 }}
            value='notifications'
            icon={<IconBell size={28} strokeWidth='1.5' />}
          />
          {currentUser && (
            <BottomNavigationAction
              component={LinkProfile}
              user={currentUser}
              value='profile'
              icon={<IconUser size={28} strokeWidth='1.5' />}
            />
          )}
          {!currentUser && (
            <BottomNavigationAction
              component={LinkSignIn}
              value='sign_in'
              icon={<IconUser size={28} strokeWidth='1.5' />}
            />
          )}
        </MuiBottomNavigation>
      </Container>
    </HideOnScroll>
  )
})

export default BottomNavigation
