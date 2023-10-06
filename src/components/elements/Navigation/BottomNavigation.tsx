import { Badge, BottomNavigationAction, Box, BottomNavigation as MuiBottomNavigation } from '@mui/material'
import { IconBell, IconHome, IconMessageCircle, IconServerBolt, IconUser } from '@tabler/icons-react'

function BottomNavigation() {
  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        height: 'min(80px, calc(56px + var(--sab)))',
        display: { md: 'none' },
        backgroundColor: (theme) => `rgba(${theme.palette.common.backgroundChannel} / 0.66)`,
        backdropFilter: 'blur(4px)',
      }}>
      <MuiBottomNavigation showLabels={false} value={'feed'} sx={{ backgroundColor: 'transparent' }}>
        <BottomNavigationAction
          value='feed'
          onClick={() => {
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            })
          }}
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
        <BottomNavigationAction value='profile' icon={<IconUser size={28} strokeWidth='1.5' />} />
      </MuiBottomNavigation>
    </Box>
  )
}

export default BottomNavigation
