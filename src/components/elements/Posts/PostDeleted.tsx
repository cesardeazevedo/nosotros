import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

export const PostDeleted = memo(function PostDeleted() {
  return (
    <html.div style={styles.root}>
      <Stack horizontal={false} sx={styles.content} align='center' gap={2}>
        <Text variant='title' size='md'>
          This event has been deleted
        </Text>
      </Stack>
    </html.div>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    padding: 28,
  },
  content: {
    opacity: 0.8,
  },
})
