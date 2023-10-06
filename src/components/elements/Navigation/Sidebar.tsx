import { Box, IconButton, SwipeableDrawer, useColorScheme } from '@mui/material'

import { IconMenu2, IconMoon, IconQrcode, IconSun } from '@tabler/icons-react'

import { Observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useStore } from 'stores'
import UserAvatar from '../User/UserAvatar'
import UserName from '../User/UserName'
import Menu from './Menu'

function Sidebar() {
  const [open, setOpen] = useState(false)
  const { mode, setMode } = useColorScheme()
  const store = useStore()
  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <IconMenu2 />
      </IconButton>
      <SwipeableDrawer
        anchor='left'
        open={open}
        onOpen={() => undefined}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: (theme) => theme.palette.common.background,
            backgroundImage: 'none',
          },
        }}>
        <Box sx={{ width: 300, p: 2 }}>
          <IconButton
            sx={{
              position: 'absolute',
              left: 20,
              bottom: 20,
              color: 'text.primary',
            }}
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
            {mode === 'light' ? <IconSun size={30} /> : <IconMoon />}
          </IconButton>
          <Observer>
            {() => {
              const { currentUser: me } = store.auth
              return (
                <>
                  <UserAvatar user={me} />
                  {me && <UserName variant='h5' user={me} sx={{ mt: 2, fontWeight: 500 }} />}
                  <IconButton
                    size='large'
                    sx={{ position: 'absolute', right: 20, top: 20, color: 'text.primary' }}
                    disabled={!me}
                    onClick={store.dialogs.openQRCode}>
                    <IconQrcode size={30} strokeWidth='2' />
                  </IconButton>
                </>
              )
            }}
          </Observer>
        </Box>
        <Box sx={{ mt: 0 }}>
          <Menu onAction={() => setOpen(false)} />
        </Box>
      </SwipeableDrawer>
    </>
  )
}

export default Sidebar
