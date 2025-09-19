import { MediaFeedLayoutButtons } from '@/components/modules/Media/MediaFeedLayoutToggles'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { MediaFeedState } from '@/hooks/state/useMediaFeed'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { FeedSettingsSafety } from '../Feed/settings/FeedSettingsSafety'
import { FeedSettingsSubmit } from '../Feed/settings/FeedSettingsSubmit'

type Props = {
  feed: MediaFeedState
  onClose?: () => void
}

export const MediaSettings = memo(function MediaSettings(props: Props) {
  const { feed, onClose } = props
  return (
    <html.div>
      <Divider />
      <Stack horizontal={false} sx={styles.content} gap={2}>
        <Text variant='label' size='lg' sx={styles.label}>
          Feed Layout
        </Text>
        <MediaFeedLayoutButtons feed={feed} />
        <FeedSettingsSafety feed={feed} />
        <FeedSettingsSubmit feed={feed} onClose={onClose} />
      </Stack>
    </html.div>
  )
})

const styles = css.create({
  content: {
    padding: spacing.padding2,
  },
  label: {
    marginLeft: spacing.margin1,
  },
})
