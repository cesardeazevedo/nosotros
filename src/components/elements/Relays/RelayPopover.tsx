import { AccordionDetails, AccordionSummary, Box, Divider, Popover, Typography } from '@mui/material'
import { IconChevronDown } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { relayStore } from 'stores/nostr/relays.store'
import { authStore } from 'stores/ui/auth.store'
import Accordion from '../Layouts/Accordion'
import { Row } from '../Layouts/Flex'
import { RelayIconButton } from './RelayIconButton'
import RelayList from './RelayList'
import RelayListOthers from './RelayListOthers'

const RelaysPopover = observer(function RelaysPopover() {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <RelayIconButton onClick={handleClick} />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        slotProps={{ paper: { sx: { ml: 8 } } }}
        transitionDuration={100}
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
            {authStore.pubkey ? 'My Relays' : 'Default Relays'}
          </Typography>
          <Divider />
          <Box sx={{ px: 2, py: 1 }}>
            {authStore.pubkey ? <RelayList relays={relayStore.myRelays} /> : <RelayListOthers relays={relayStore.others} />}
          </Box>
          <Divider />
          {authStore.pubkey && (
            <Row sx={{ px: 0 }}>
              <Accordion sx={{ width: '100%' }}>
                <AccordionSummary sx={{ height: 30 }} expandIcon={<IconChevronDown strokeWidth='1.5' />}>
                  <Typography variant='subtitle1' sx={{ px: 2, py: 1 }}>
                    Other Relays ({relayStore.others.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <RelayListOthers relays={relayStore.others} />
                </AccordionDetails>
              </Accordion>
            </Row>
          )}
        </Box>
      </Popover>
    </>
  )
})

export default RelaysPopover
