import { repliesLeftAtomFamily } from '@/atoms/replies.atoms'
import { Button } from '@/components/ui/Button/Button'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { useEventReplies } from '@/hooks/query/useReplies'
import type { NoteState } from '@/hooks/state/useNote'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconDotsVertical } from '@tabler/icons-react'
import { useAtomValue } from 'jotai'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'

type Props = {
  note: NoteState
  disabled?: boolean
}

export const RepliesLoadMore = function RepliesLoadMore(props: Props) {
  const { note, disabled } = props
  const {
    query: { isLoading },
  } = useEventReplies(note.event)
  const { total } = useEventReplies(note.event)
  const repliesLeft = useAtomValue(repliesLeftAtomFamily({ id: note.event.id, limit: note.state.pageSize }))
  const noRepliesLeft = !isLoading && !!note.state.repliesOpen && repliesLeft === 0
  const handleClick = (e: StrictClickEvent) => {
    e.stopPropagation()
    if (note.state.repliesOpen) {
      note.paginate(undefined, total)
    } else {
      note.actions.toggleReplies()
    }
  }
  return (
    <Stack sx={styles.root} gap={1}>
      <html.span style={styles.leading}>
        {isLoading ? <CircularProgress size='sm' /> : <IconDotsVertical {...css.props(styles.icon)} />}
      </html.span>
      <Button variant='filledTonal' onClick={handleClick} disabled={isLoading || (disabled ?? noRepliesLeft)}>
        {isLoading ? 'Loading replies' : noRepliesLeft ? 'No replies left' : `See More ${repliesLeft || ''} replies`}
      </Button>
    </Stack>
  )
}

const styles = css.create({
  root: {
    paddingLeft: 28,
    marginBottom: spacing.margin1,
  },
  leading: {
    width: 28,
    color: palette.outlineVariant,
  },
  icon: {
    position: 'relative',
    right: 5,
  },
})
