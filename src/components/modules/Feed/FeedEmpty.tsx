import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { FeedState } from '@/hooks/state/useFeed'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

type Props = {
  feed: FeedState
}

export const FeedEmpty = (props: Props) => {
  const { feed } = props
  return (
    <Stack horizontal={false} align='center' justify='center' sx={styles.root} gap={2}>
      <Text variant='title' size='lg'>
        Feed is empty
      </Text>
      <Button variant='filledTonal' onClick={() => feed.onRefresh()}>
        Refresh
      </Button>
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding4,
    minHeight: 350,
  },
})
