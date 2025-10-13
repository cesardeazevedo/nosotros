import { useContentContext } from '@/components/providers/ContentProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { NoteState } from '@/hooks/state/useNote'
import { IconServerBolt } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { memo, useCallback } from 'react'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { PostStats } from '../PostStats'
import { ButtonContainer } from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  note: NoteState
  popover?: boolean
}

export const PostButtonStats = memo(function PostButtonStats(props: Props) {
  const { note, popover = false } = props
  const { dense } = useContentContext()
  const isMobile = useMobile()

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      e.preventDefault()
      e.stopPropagation()
      note.actions.toggleStats()
    },
    [isMobile],
  )

  const Button = (
    <IconButton
      variant={note.state.statsOpen ? 'filledTonal' : 'standard'}
      toggle={note.state.statsOpen}
      selected={note.state.statsOpen}
      size={dense ? 'sm' : 'md'}
      onClick={handleClick}
      icon={<IconServerBolt size={dense ? iconProps.size$dense : iconProps.size} strokeWidth={iconProps.strokeWidth} />}
    />
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
      {popover ? (
        <PopoverBase
          placement='bottom'
          opened={note.state.statsOpen}
          onClose={() => note.actions.toggleStats(false)}
          contentRenderer={() => (
            <Paper outlined surface='surfaceContainerLowest' sx={styles.popover}>
              <PostStats note={note} />
            </Paper>
          )}>
          {({ getProps, setRef }) => (
            <ButtonContainer {...getProps} ref={setRef} value={note.seenOn?.length || 0} aria-label='Seen on relays'>
              {Button}
            </ButtonContainer>
          )}
        </PopoverBase>
      ) : (
        <ButtonContainer value={note.seenOn?.length || 0} aria-label='Seen on relays'>
          {Button}
        </ButtonContainer>
      )}
    </Tooltip>
  )
})

const styles = css.create({
  popover: {
    maxWidth: 400,
    maxHeight: 400,
    overflowY: 'auto',
  },
})
