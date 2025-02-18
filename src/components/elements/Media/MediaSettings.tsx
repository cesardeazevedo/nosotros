import { MediaFeedLayoutButtons } from '@/components/modules/Media/MediaFeedLayoutToggles'
import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { MediaModule } from '@/stores/modules/media.module'
import { spacing } from '@/themes/spacing.stylex'
import type { IconProps } from '@tabler/icons-react'
import { IconBlur } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'

const iconProps: IconProps = {
  size: 18,
  strokeWidth: '1.5',
}

type Props = {
  module: MediaModule
}

export const MediaSettings = observer(function MediaSettings(props: Props) {
  const { module } = props
  return (
    <html.div style={styles.root}>
      <Divider />
      <Stack horizontal={false} sx={styles.content} gap={2}>
        <Text variant='label' size='lg' sx={styles.label}>
          Feed Layout
        </Text>
        <MediaFeedLayoutButtons module={module} />
        <Text variant='label' size='lg' sx={styles.label}>
          Safety
        </Text>
        <Stack gap={0.5} wrap>
          <Chip
            selected={module.feed.blured}
            variant='filter'
            icon={<IconBlur {...iconProps} />}
            label='Blur Images'
            onClick={() => module.feed.toggle('blured')}
          />
        </Stack>
      </Stack>
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
  },
  content: {
    padding: spacing.padding2,
  },
  label: {
    marginLeft: spacing.margin1,
  },
})
