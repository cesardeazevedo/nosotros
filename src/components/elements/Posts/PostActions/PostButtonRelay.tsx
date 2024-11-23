import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconServerBolt } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import type { Note } from 'stores/models/note'
import { ButtonContainer, type ContainerProps } from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  note: Note
  dense?: boolean
}

export const ButtonRelays = observer(function PostRelays(props: Props & ContainerProps) {
  const { note, dense = false } = props
  const isMobile = useMobile()

  const handleClick = useCallback(() => {
    note.toggleBroadcast()
  }, [isMobile])

  return (
    <Tooltip
      cursor='arrow'
      key={isMobile.toString()}
      enterDelay={0}
      text={<div>Seen on {note.seenOn?.map((relay) => <div key={relay}>{relay.replace('wss://', '')}</div>)}</div>}>
      <ButtonContainer value={note.seenOn?.length || 0} dense={dense} aria-label='Seen on relays'>
        <IconButton
          size={dense ? 'sm' : 'md'}
          onClick={handleClick}
          icon={
            <IconServerBolt size={dense ? iconProps.size$dense : iconProps.size} strokeWidth={iconProps.strokeWidth} />
          }
        />
      </ButtonContainer>
    </Tooltip>
  )
})
