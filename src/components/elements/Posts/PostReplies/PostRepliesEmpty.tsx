import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { IconMessageCircle2 } from '@tabler/icons-react'
import { css } from 'react-strict-dom'

export const PostRepliesEmpty = () => (
  <Stack horizontal={false} gap={1} align='center' sx={styles.root}>
    <IconMessageCircle2 size={40} strokeWidth='1.2' />
    <Text variant='body' size='lg'>
      No Replies yet
    </Text>
  </Stack>
)

const styles = css.create({
  root: {
    paddingBlock: spacing.padding1,
  },
})
