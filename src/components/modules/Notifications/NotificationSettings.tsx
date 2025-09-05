import { toggleSettingAtom } from '@/atoms/settings.atoms'
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
} from '@tabler/icons-react'
import { useSetAtom } from 'jotai'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  feed: NotificationFeedState
}

const iconProps: IconProps = {
  size: 18,
  strokeWidth: '1.5',
}

export const NotificationSettings = memo(function NotificationSettings(props: Props) {
  const { feed } = props
  const toggleSettings = useSetAtom(toggleSettingAtom)
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
            onClick={() => feed.toggleKind(Kind.Reaction)}
          />
          <Chip
            label='Reposts'
            variant='filter'
            selected={feed.hasKind(Kind.Repost)}
            icon={<IconShare3 {...iconProps} />}
            onClick={() => feed.toggleKind(Kind.Repost)}
          />
          <Chip
            label='Replies'
            variant='filter'
            selected={feed.includeReplies}
            icon={<IconMessage {...iconProps} />}
            onClick={() => feed.setIncludeReplies((prev) => !prev)}
          />
          <Chip
            selected={feed.includeMentions}
            label='Mentions'
            variant='filter'
            icon={<IconAt {...iconProps} />}
            onClick={() => feed.setIncludeMentions((prev) => !prev)}
          />
          <Chip
            selected={feed.hasKind(Kind.ZapReceipt)}
            label='Zaps'
            variant='filter'
            icon={<IconBolt {...iconProps} />}
            onClick={() => feed.toggleKind(Kind.ZapReceipt)}
          />
          {/* <Chip */}
          {/*   selected={feed.includeMuted} */}
          {/*   label='Muted' */}
          {/*   variant='filter' */}
          {/*   icon={<IconVolumeOff {...iconProps} />} */}
          {/*   onClick={() => feed.setIncludeMuted((prev) => !prev)} */}
          {/* /> */}
        </Stack>
        <Text variant='label' size='lg' sx={styles.label}>
          Layout
        </Text>
        <Stack gap={1}>
          <Chip
            selected={feed.layout === 'normal'}
            label='Normal'
            variant='filter'
            icon={<IconBaselineDensityLarge {...iconProps} />}
            onClick={() => {
              feed.setLayout('normal')
              toggleSettings('notificationsCompact', false)
            }}
          />
          <Chip
            selected={feed.layout === 'compact'}
            label='Compact'
            variant='filter'
            icon={<IconBaselineDensitySmall {...iconProps} />}
            onClick={() => {
              feed.setLayout('compact')
              toggleSettings('notificationsCompact', true)
            }}
          />
        </Stack>
        <Stack>
          <Chip label='Reset' variant='assist' onClick={() => feed.resetFilter()} />
        </Stack>
      </Stack>
      <Divider />
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
