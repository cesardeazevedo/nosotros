import type Note from 'stores/models/note'
import UserHeader from '../User/UserHeader'
import PostOptions from './PostOptions'
import { Stack } from '@/components/ui/Stack/Stack'
import { css } from 'react-strict-dom'
import { spacing } from '@/themes/spacing.stylex'

type Props = {
  note: Note
}

function PostHeader(props: Props) {
  const { note } = props
  return (
    <Stack horizontal justify='space-between' sx={styles.root}>
      <UserHeader note={note} />
      <PostOptions note={note} />
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
})

export default PostHeader
