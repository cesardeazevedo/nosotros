import { Box, Button, Divider, IconButton, Popover, Typography } from '@mui/material'
import { IconSettings } from '@tabler/icons-react'
import { useState } from 'react'
import Tooltip from '../Layouts/Tooltip'
import SettingsNostr from './SettingsNostr'
import { Row } from '../Layouts/Flex'
import ThemeButton from '../Buttons/ThemeButton'

function SettingsPopover() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <Tooltip arrow title='Settings'>
        <IconButton color='inherit' onClick={handleClick} sx={{ mx: 0.5 }}>
          <IconSettings strokeWidth='1.4' />
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        transitionDuration={100}
        slotProps={{ paper: { sx: { ml: 1 } } }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}>
        <Box sx={{ width: 310 }}>
          <Row sx={{ justifyContent: 'space-between' }}>
            <Typography variant='h6' sx={{ px: 2, py: 1 }}>
              Settings
            </Typography>
            <ThemeButton />
          </Row>
          <Divider />
          <SettingsNostr />
          <Divider />
          <Box sx={{ p: 1 }}>
            <Button fullWidth size='small' color='info'>
              See full settings
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  )
}

export default SettingsPopover
