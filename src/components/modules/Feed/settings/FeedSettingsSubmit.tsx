import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedState } from '@/hooks/state/useFeed'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

type Props = {
  feed: FeedState
  onClose?: () => void
}

export const FeedSettingsSubmit = (props: Props) => {
  const { feed, onClose } = props
  return (
    <Stack gap={0.5} sx={styles.root}>
      <Button
        disabled={!feed.isModified}
        variant='filledTonal'
        onClick={() => {
          feed.resetFeed()
          onClose?.()
        }}>
        Reset
      </Button>
      <Button
        disabled={!feed.isDirty}
        variant='filled'
        onClick={() => {
          feed.saveFeed()
          onClose?.()
        }}>
        Save Feed Changes
      </Button>
    </Stack>
  )
}

const styles = css.create({
  root: {
    marginTop: spacing.margin1,
  },
})
