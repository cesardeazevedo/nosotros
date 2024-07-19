import { Box, Divider, IconButton, Popover, Tooltip, Typography } from '@mui/material'
import { IconServerBolt } from '@tabler/icons-react'
import { Observer } from 'mobx-react-lite'
import { useState } from 'react'
import { relayStore } from 'stores/nostr/relays.store'
import { Row } from '../Layouts/Flex'
import RelayList from './RelayList'

function RelaysPopover() {
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
      <Tooltip arrow title='Configure Relays' enterDelay={0}>
        <Row sx={{ mx: 0.5, ['@media (max-width: 1140px)']: { display: 'none' } }}>
          <IconButton onClick={handleClick} color='inherit'>
            <IconServerBolt strokeWidth='1.5' />
          </IconButton>
          <Typography variant='body2'>
            <Observer>
              {() => (
                <>
                  {relayStore.myConnectedRelays.length || 0}/{relayStore.myRelays.length}
                </>
              )}
            </Observer>
          </Typography>
        </Row>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        slotProps={{ paper: { sx: { ml: 8 } } }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}>
        <Box sx={{ minWidth: 250, maxWidth: 300 }}>
          <Typography variant='subtitle1' sx={{ px: 2, py: 1 }}>
            My Relays
          </Typography>
          <Divider />
          <Box sx={{ p: 2 }}>
            <RelayList relays={relayStore.myRelays} />
          </Box>
        </Box>
      </Popover>
    </>
  )
}

export default RelaysPopover
