import { useContentContext } from '@/components/providers/ContentProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { useSeenRelays } from '@/hooks/query/useSeen'
import type { NoteState } from '@/hooks/state/useNote'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import type { ReferenceType } from '@floating-ui/react'
import { IconServerBolt } from '@tabler/icons-react'
import { memo, useCallback } from 'react'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { PostStats } from '../PostStats'
import { iconProps } from './utils'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useMobile } from '@/hooks/useMobile'

type Props = {
  note: NoteState
  popover?: boolean
}

type PropsInner = {
  note: NoteState
  dense: boolean
  ref?: ((ref: ReferenceType | null) => void) | null
}

const PostButtonStatsInner = (props: PropsInner) => {
  const { note, dense } = props
  const isMobile = useMobile()
  const seenOn = useSeenRelays(note.event.id)
  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      e.preventDefault()
      e.stopPropagation()
      note.actions.toggleStats()
    },
    [isMobile],
  )

  const content = (
    <Stack sx={styles.root}>
      <IconButton
        variant={note.state.statsOpen ? 'filledTonal' : 'standard'}
        toggle={note.state.statsOpen}
        selected={note.state.statsOpen}
        size={dense ? 'sm' : 'md'}
        onClick={handleClick}
        icon={
          <IconServerBolt size={dense ? iconProps.size$dense : iconProps.size} strokeWidth={iconProps.strokeWidth} />
        }
      />
      {seenOn?.length || ''}
    </Stack>
  )

  if (!seenOn?.length) {
    return content
  }

  return (
    <Tooltip
      cursor='arrow'
      key={isMobile.toString()}
      enterDelay={0}
      text={seenOn && (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          Seen on{'\n'}
          {seenOn?.map((relay) => relay.replace('wss://', '')).join('\n')}
        </div>
      )}>
      {content}
    </Tooltip>
  )
}

export const PostButtonStats = memo(function PostButtonStats(props: Props) {
  const { note, popover = false } = props
  const { dense } = useContentContext()

  if (popover) {
    return (
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
          <PostButtonStatsInner {...getProps()} ref={setRef} note={note} dense={dense} />
        )}
      </PopoverBase>
    )
  }
  return <PostButtonStatsInner note={note} dense={dense} />
})

const styles = css.create({
  root: {
    display: 'inline-flex',
    fontSize: typeScale.bodySize$lg,
    marginRight: spacing.margin1,
    fontWeight: 500,
  },
  popover: {
    maxWidth: 400,
    maxHeight: 400,
    overflowY: 'auto',
  },
})
