import { Button } from '@/components/ui/Button/Button'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Note } from '@/stores/notes/note'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconDotsVertical } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'

type Props = {
  note: Note
  disabled?: boolean
  onClick?: () => void
}

export const PostLoadMore = observer(function PostLoadMore(props: Props) {
  const { note, onClick, disabled } = props
  const loading = note.isLoading
  const noRepliesLeft = !loading && !!note.repliesOpen && note.repliesLeft === 0
  return (
    <Stack sx={styles.root} gap={1}>
      <html.span style={styles.leading}>
        {loading ? <CircularProgress size='sm' /> : <IconDotsVertical {...css.props(styles.icon)} />}
      </html.span>
      <Button variant='filledTonal' onClick={() => onClick?.()} disabled={loading || (disabled ?? noRepliesLeft)}>
        {loading ? 'Loading replies' : noRepliesLeft ? 'No replies left' : `See More ${note.repliesLeft || ''} replies`}
      </Button>
    </Stack>
  )
})

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
