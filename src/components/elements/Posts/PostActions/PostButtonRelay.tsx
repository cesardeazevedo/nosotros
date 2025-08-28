import { useContentContext } from '@/components/providers/ContentProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { NoteState } from '@/hooks/state/useNote'
import { IconServerBolt } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { memo, useCallback } from 'react'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { ButtonContainer } from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  note: NoteState
}

export const ButtonRelays = memo(function ButtonRelays(props: Props) {
  const { note } = props
  const { dense } = useContentContext()
  const isMobile = useMobile()

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      e.preventDefault()
      e.stopPropagation()
      note.actions.toggleBroadcast()
    },
    [isMobile],
  )

  return (
    <Tooltip
      cursor='arrow'
      key={isMobile.toString()}
      enterDelay={0}
      text={
        <div style={{ whiteSpace: 'pre-wrap' }}>
          Seen on{'\n'}
          {note.seenOn?.map((relay) => relay.replace('wss://', '')).join('\n')}
        </div>
      }>
      <ButtonContainer value={note.seenOn?.length || 0} aria-label='Seen on relays'>
        <IconButton
          toggle={note.state.broadcastOpen}
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
