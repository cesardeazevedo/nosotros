import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { MediaFeedState } from '@/hooks/state/useMediaFeed'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { MediaFeedLayoutButtons } from './MediaFeedLayoutToggles'

type Props = {
  feed: MediaFeedState
}

export const MediaHeader = memo(function MediaHeader(props: Props) {
  const { feed } = props
  return (
    <FeedHeaderBase
      label='Media'
      feed={feed}
      customSettings={
        <>
          <Divider />
          <Stack sx={styles.settings}>
            <MediaFeedLayoutButtons feed={feed} />
          </Stack>
        </>
      }
    />
  )
})

const styles = css.create({
  settings: {
    padding: spacing.padding2,
  },
})
