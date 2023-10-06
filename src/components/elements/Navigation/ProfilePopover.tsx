import { Box, IconButton, Popover } from '@mui/material'
import { IconQrcode } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { useStore } from 'stores'
import { Row } from '../Layouts/Flex'
import Tooltip from '../Layouts/Tooltip'
import UserAvatar from '../User/UserAvatar'
import UserName from '../User/UserName'
import Menu from './Menu'

const ProfilePopover = observer(function ProfilePopover() {
  const store = useStore()
  const { currentUser: user } = store.auth
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
        <UserAvatar user={user} />
      </div>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
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
          <img src={user?.banner} style={{ maxHeight: 110, width: '100%', objectFit: 'cover' }} />
          <Row sx={{ px: 2, justifyContent: 'space-between' }}>
            <UserName variant='h6' user={user} />
            <Tooltip arrow placement='bottom' title='Use the QR Code to scan your npub on your mobile device'>
              <IconButton sx={{ color: 'text.primary' }} onClick={store.dialogs.openQRCode}>
                <IconQrcode />
              </IconButton>
            </Tooltip>
          </Row>
          <Menu dense />
        </Box>
      </Popover>
    </Box>
  )
})

export default ProfilePopover
