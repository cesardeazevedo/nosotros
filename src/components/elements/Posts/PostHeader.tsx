import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import { PostOptions } from './PostOptions'
import { PostUserHeader } from './PostUserHeader'

type Props = {
  renderOptions?: boolean
}

export const PostHeader = function PostHeader(props: Props) {
  const { renderOptions = true } = props
  return (
    <Stack horizontal justify='space-between' sx={styles.root}>
      <PostUserHeader />
      {renderOptions && <PostOptions />}
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
})
