import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import { PostOptions } from './PostOptions'
import { PostUserHeader } from './PostUserHeader'

type Props = {
  event: NostrEventDB
  renderOptions?: boolean
}

export const PostHeader = function PostHeader(props: Props) {
  const { event, renderOptions = true } = props
  return (
    <Stack horizontal justify='space-between' sx={styles.root}>
      <PostUserHeader event={event} />
      {renderOptions && <PostOptions event={event} />}
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
})
