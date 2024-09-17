import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { IconMessageCircle2 } from '@tabler/icons-react'
import { html, css } from 'react-strict-dom'

export const PostRepliesEmpty = () => (
  <html.div style={styles.root}>
    <IconMessageCircle2 size={40} strokeWidth='1.4' />
    <Text variant='title' size='md'>
      No Replies yet
    </Text>
  </html.div>
)

const styles = css.create({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: spacing.padding4,
  },
})
