import { Box, IconButton } from '@mui/material'
import { IconServerBolt } from '@tabler/icons-react'
import Tooltip from 'components/elements/Layouts/Tooltip'
import { useMobile } from 'hooks/useMobile'
import { useStore } from 'hooks/useStore'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import ButtonContainer, { type ContainerProps } from './PostButtonContainer'

type Props = {
  eventId: string
}

const PostButtonRelays = observer(function PostRelays(props: Props & ContainerProps) {
  const { eventId, dense } = props
  const store = useStore()
  const relays = store.nostr.getEventRelays(eventId)
  const [open, setOpen] = useState(false)
  const isMobile = useMobile()
  const mobileProps = isMobile ? { open, onClose: () => setOpen(false) } : {}
  return (
    <Tooltip
      arrow
      key={isMobile.toString()}
      enterDelay={0}
      {...mobileProps}
      slotProps={{ arrow: { sx: { left: '-8px!important' } } }}
      title={<Box>Seen on {relays?.map((relay) => <Box key={relay}>{new URL(relay).hostname}</Box>)}</Box>}>
      <ButtonContainer
        value={relays?.length || 0}
        dense={dense}
        onClick={() => isMobile && setOpen(true)}
        aria-label='Seen on relays'>
        <IconButton disableRipple size='small'>
          <IconServerBolt strokeWidth='1.5' />
        </IconButton>
      </ButtonContainer>
    </Tooltip>
  )
})

export default PostButtonRelays
