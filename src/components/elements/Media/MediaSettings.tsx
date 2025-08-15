import { MediaFeedLayoutButtons } from '@/components/modules/Media/MediaFeedLayoutToggles'
import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { MediaFeedState } from '@/hooks/state/useMediaFeed'
import { spacing } from '@/themes/spacing.stylex'
import type { IconProps } from '@tabler/icons-react'
import { IconBlur } from '@tabler/icons-react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

const iconProps: IconProps = {
  size: 18,
  strokeWidth: '1.5',
}

type Props = {
  feed: MediaFeedState
}

export const MediaSettings = memo(function MediaSettings(props: Props) {
  const { feed } = props
  return (
    <html.div style={styles.root}>
      <Divider />
      <Stack horizontal={false} sx={styles.content} gap={2}>
        <Text variant='label' size='lg' sx={styles.label}>
          Feed Layout
        </Text>
        <MediaFeedLayoutButtons feed={feed} />
        <Text variant='label' size='lg' sx={styles.label}>
          Safety
        </Text>
        <Stack gap={0.5} wrap>
          <Chip
            selected={feed.blured}
            variant='filter'
            icon={<IconBlur {...iconProps} />}
            label='Blur Images'
            onClick={() => feed.setBlured((prev) => !prev)}
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
