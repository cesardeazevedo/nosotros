import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import type { NotificationFeedState } from '@/hooks/state/useNotificationFeed'
import { spacing } from '@/themes/spacing.stylex'
import type { IconProps } from '@tabler/icons-react'
import {
  IconAt,
  IconBaselineDensityLarge,
  IconBaselineDensitySmall,
  IconBolt,
  IconHeart,
  IconMessage,
  IconShare3,
  IconUserCancel,
} from '@tabler/icons-react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { FeedSettingsSubmit } from '../Feed/settings/FeedSettingsSubmit'

type Props = {
  feed: NotificationFeedState
  onClose?: () => void
}

const iconProps: IconProps = {
  size: 18,
  strokeWidth: '1.5',
}

export const NotificationSettings = memo(function NotificationSettings(props: Props) {
  const { feed, onClose } = props
  return (
    <html.div style={styles.root}>
      <Divider />
      <Stack horizontal={false} sx={styles.content} gap={1}>
        <Text variant='label' size='lg' sx={styles.label}>
          Notifications Settings
        </Text>
        <Stack gap={0.5} wrap>
          <Chip
            variant='filter'
            label='Reactions'
            selected={feed.hasKind(Kind.Reaction)}
            icon={<IconHeart {...iconProps} />}
            selectedIcon={null}
            onClick={() => feed.toggleKind(Kind.Reaction)}
          />
          <Chip
            label='Reposts'
            variant='filter'
            selected={feed.hasKind(Kind.Repost)}
            icon={<IconShare3 {...iconProps} />}
            selectedIcon={null}
            onClick={() => feed.toggleKind(Kind.Repost)}
          />
          <Chip
            label='Replies'
            variant='filter'
            selected={feed.includeReplies}
            icon={<IconMessage {...iconProps} />}
            selectedIcon={null}
            onClick={() => feed.setIncludeReplies((prev) => !prev)}
          />
          <Chip
            selected={feed.includeMentions}
            label='Mentions'
            variant='filter'
            icon={<IconAt {...iconProps} />}
            selectedIcon={null}
            onClick={() => feed.setIncludeMentions((prev) => !prev)}
          />
          <Chip
            selected={feed.hasKind(Kind.ZapReceipt)}
            label='Zaps'
            variant='filter'
            icon={<IconBolt {...iconProps} />}
            selectedIcon={null}
            onClick={() => feed.toggleKind(Kind.ZapReceipt)}
          />
          <Chip
            selected={feed.includeMuted}
            label='Muted'
            variant='filter'
            icon={<IconUserCancel {...iconProps} />}
            selectedIcon={null}
            onClick={() => feed.setIncludeMuted((prev) => !prev)}
          />
        </Stack>
        <Text variant='label' size='lg' sx={styles.label}>
          Layout
        </Text>
        <Stack gap={1}>
          <Chip
            selected={!feed.compact}
            label='Normal'
            variant='filter'
            icon={<IconBaselineDensityLarge {...iconProps} />}
            onClick={() => feed.setCompact(false)}
          />
          <Chip
            selected={feed.compact}
            label='Compact'
            variant='filter'
            icon={<IconBaselineDensitySmall {...iconProps} />}
            onClick={() => feed.setCompact(true)}
          />
        </Stack>
        <Stack>
          <Chip label='Reset' variant='assist' onClick={() => feed.resetFeed()} />
        </Stack>
        <FeedSettingsSubmit feed={feed} onClose={onClose} />
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
