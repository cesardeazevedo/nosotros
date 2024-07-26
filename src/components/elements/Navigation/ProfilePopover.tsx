import { Box, IconButton, Popover } from '@mui/material'
import { IconQrcode } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { authStore } from 'stores/ui/auth.store'
import { dialogStore } from 'stores/ui/dialogs.store'
import { Row } from '../Layouts/Flex'
import Tooltip from '../Layouts/Tooltip'
import UserAvatar from '../User/UserAvatar'
import UserName from '../User/UserName'
import Menu from './Menu'

const ProfilePopover = observer(function ProfilePopover() {
  const { currentUser: user } = authStore
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
  const handleOpen = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(e.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  return (
    <Box>
      <div onClick={handleOpen}>
        <UserAvatar user={user} disableLink disabledPopover />
      </div>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        transitionDuration={150}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={handleClose}>
        <Box sx={{ width: 260 }}>
          <img src={user?.meta.banner} style={{ maxHeight: 110, width: '100%', objectFit: 'cover' }} />
          <Row sx={{ px: 2, justifyContent: 'space-between' }}>
            <UserName variant='h6' user={user} disableLink disablePopover />
            <Tooltip arrow placement='bottom' title='Use the QR Code to scan your npub on your mobile device'>
              <IconButton sx={{ color: 'text.primary' }} onClick={dialogStore.openQRCode}>
                <IconQrcode strokeWidth='1.5' />
              </IconButton>
            </Tooltip>
          </Row>
          <Menu dense onAction={handleClose} />
        </Box>
      </Popover>
    </Box>
  )
})

export default ProfilePopover
