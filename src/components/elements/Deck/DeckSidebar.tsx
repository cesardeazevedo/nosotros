import { Box, Button, IconButton, styled } from "@mui/material"
import { IconEditCircle, IconSquareRoundedPlus } from "@tabler/icons-react"
import { observer } from "mobx-react-lite"
import Tooltip from "../Layouts/Tooltip"
import ProfilePopover from "../Navigation/ProfilePopover"

const Container = styled(Box)(({ theme }) => theme.unstable_sx({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'background.paper',
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  maxWidth: 74,
  minWidth: '74px!important',
  py: 2,
  pt: '64px!important',
  zIndex: 100
}))

const DeckSidebar = observer(function DeckSidebar() {
  return (
    <Container>
      <Box sx={{ py: 2 }}>
        <Tooltip arrow enterDelay={0} title='Create note' placement="right">
          <Button color='info' variant='contained' sx={{ borderRadius: 24, minWidth: 50, height: 50, px: 0 }}>
            <IconEditCircle strokeWidth='1.2' size={24} />
          </Button>
        </Tooltip>
      </Box>
      <Box sx={{ pb: 2 }}>
        <Tooltip arrow enterDelay={0} title='Add column' placement="right">
          <IconButton sx={{ mb: 0 }} color='info'>
            <IconSquareRoundedPlus size={28} strokeWidth='1.5' />
          </IconButton>
        </Tooltip>
        <Box sx={{ mt: 2 }}>
          <ProfilePopover />
        </Box>
      </Box>
    </Container>
  )
})

export default DeckSidebar
