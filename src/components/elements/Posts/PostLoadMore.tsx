import { Button } from '@/components/ui/Button/Button'
import type { Note } from '@/stores/notes/note'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'

type Props = {
  note: Note
  disabled?: boolean
  onClick?: () => void
}

export const PostLoadMore = observer(function PostLoadMore(props: Props) {
  const { note, onClick, disabled } = props
  return (
    <html.div style={styles.root}>
      <Button variant='filledTonal' onClick={() => onClick?.()} disabled={disabled ?? note.repliesLeft === 0}>
        See More {note.repliesLeft || ''} replies
      </Button>
    </html.div>
  )
})

const styles = css.create({
  root: {
    paddingLeft: spacing.padding1,
  },
})
