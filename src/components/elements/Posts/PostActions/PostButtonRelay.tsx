import { IconServerBolt } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import type Note from 'stores/models/note'
import ButtonContainer, { type ContainerProps } from './PostButtonContainer'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { iconProps } from './utils'

type Props = {
  note: Note
  dense?: boolean
}

const PostButtonRelays = observer(function PostRelays(props: Props & ContainerProps) {
  const { note, dense = false } = props
  const [open, setOpen] = useState(false)
  const isMobile = useMobile()
  const mobileProps = isMobile ? { open, onClose: () => setOpen(false) } : {}
  return (
    <Tooltip
      cursor='arrow'
      key={isMobile.toString()}
      enterDelay={0}
      {...mobileProps}
      text={<div>{note.seenOn?.map((relay) => <div key={relay}>{relay.replace('wss://', '')}</div>)}</div>}>
      <ButtonContainer
        value={note.seenOn?.length || 0}
        dense={dense}
        onClick={() => isMobile && setOpen(true)}
        aria-label='Seen on relays'>
        <IconButton
          disabledRipple
          size={dense ? 'sm' : 'md'}
          icon={
            <IconServerBolt size={dense ? iconProps.size$dense : iconProps.size} strokeWidth={iconProps.strokeWidth} />
          }
        />
      </ButtonContainer>
    </Tooltip>
  )
})

export default PostButtonRelays
