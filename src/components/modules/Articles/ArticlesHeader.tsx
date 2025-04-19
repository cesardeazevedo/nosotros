import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

export const ArticlesHeader = observer(function ArticlesHeader() {
  return (
    <Stack justify='space-between' sx={styles.root}>
      <div>
        <Text variant='title' size='lg'>
          Articles
        </Text>
      </div>
    </Stack>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
})
