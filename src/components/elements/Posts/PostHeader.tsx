import { Stack } from '@/components/ui/Stack/Stack'
import type { Note } from '@/stores/notes/note'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import { UserHeader } from '../User/UserHeader'
import { PostOptions } from './PostOptions'

type Props = {
  note: Note
  renderOptions?: boolean
}

export const PostHeader = (props: Props) => {
  const { note, renderOptions = true } = props
  return (
    <Stack horizontal justify='space-between' sx={styles.root}>
      <UserHeader pubkey={note.event.pubkey} note={note} />
      {renderOptions && <PostOptions note={note} />}
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
})
