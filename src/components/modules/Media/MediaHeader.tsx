import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { MediaModule } from '@/stores/modules/media.module'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { MediaFeedLayoutButtons } from './MediaFeedLayoutToggles'

type Props = {
  module?: MediaModule
}

export const MediaHeader = (props: Props) => {
  const { module } = props
  return (
    <FeedHeaderBase
      label='Media'
      feed={module?.feed}
      customSettings={
        <>
          <Divider />
          <Stack sx={styles.settings}>
            <MediaFeedLayoutButtons module={module} />
          </Stack>
        </>
      }
    />
  )
}

const styles = css.create({
  settings: {
    padding: spacing.padding2,
  },
})
