import { Stack } from '@/components/ui/Stack/Stack'
import type { Note } from '@/stores/notes/note'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import { PostOptions } from './PostOptions'
import { PostUserHeader } from './PostUserHeader'

type Props = {
  note: Note
  renderOptions?: boolean
}

export const PostHeader = function PostHeader(props: Props) {
  const { note, renderOptions = true } = props
  return (
    <Stack horizontal justify='space-between' sx={styles.root}>
      <PostUserHeader note={note} />
      {renderOptions && <PostOptions note={note} />}
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
})
