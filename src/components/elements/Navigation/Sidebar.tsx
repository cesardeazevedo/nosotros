import { Box, IconButton, SwipeableDrawer } from '@mui/material'
import { IconMenu2, IconQrcode } from '@tabler/icons-react'
import { Observer } from 'mobx-react-lite'
import { useState } from 'react'
import { authStore } from 'stores/ui/auth.store'
import ThemeButton from '../Buttons/ThemeButton'
import UserAvatar from '../User/UserAvatar'
import UserName from '../User/UserName'
import Menu from './Menu'
import { dialogStore } from 'stores/ui/dialogs.store'

function Sidebar() {
  const [open, setOpen] = useState(false)
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
          <ThemeButton sx={{ position: 'absolute', left: 30, bottom: 30 }} />
          <Observer>
            {() => {
              const { currentUser: me } = authStore
              return (
                <>
                  <UserAvatar user={me} />
                  {me && <UserName variant='h5' user={me} sx={{ mt: 2, fontWeight: 500 }} />}
                  <IconButton
                    size='large'
                    sx={{ position: 'absolute', right: 20, top: 20, color: 'text.primary' }}
                    disabled={!me}
                    onClick={dialogStore.openQRCode}>
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
