import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import type { Note } from 'stores/models/note'
import { UserHeader } from '../User/UserHeader'
import { PostOptions } from './PostOptions'

type Props = {
  note: Note
}

export const PostHeader = (props: Props) => {
  const { note } = props
  return (
    <Stack horizontal justify='space-between' sx={styles.root}>
      <UserHeader pubkey={note.event.pubkey} note={note} />
      <PostOptions note={note} />
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
})
