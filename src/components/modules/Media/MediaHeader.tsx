import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { MediaModule } from '@/stores/modules/media.module'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import { MediaFeedLayoutButtons } from './MediaFeedLayoutToggles'

type Props = {
  module?: MediaModule
}

export const MediaFeedHeader = (props: Props) => {
  return (
    <Stack justify='space-between' sx={styles.root}>
      <div>
        <Text variant='title' size='lg'>
          Media
        </Text>
      </div>
      <MediaFeedLayoutButtons module={props.module} />
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
})
