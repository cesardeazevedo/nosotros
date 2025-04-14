import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import type { FeedModule } from '@/stores/modules/feed.module'
import { spacing } from '@/themes/spacing.stylex'
import type { IconProps } from '@tabler/icons-react'
import { IconAt, IconBolt, IconHeart, IconMessage, IconShare3, IconVolumeOff } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'

type Props = {
  module: FeedModule
}

const iconProps: IconProps = {
  size: 18,
  strokeWidth: '1.5',
}

export const NotificationSettings = observer(function NotificationSettings(props: Props) {
  const { module } = props
  const { feed } = module
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
            selected={feed.options.includeReplies}
            icon={<IconMessage {...iconProps} />}
            onClick={() => feed.options.toggle('includeReplies')}
          />
          <Chip
            selected={feed.options.includeMentions}
            label='Mentions'
            variant='filter'
            icon={<IconAt {...iconProps} />}
            onClick={() => feed.options.toggle('includeMentions')}
          />
          <Chip
            selected={feed.hasKind(Kind.ZapReceipt)}
            label='Zaps'
            variant='filter'
            icon={<IconBolt {...iconProps} />}
            onClick={() => feed.toggleKind(Kind.ZapReceipt)}
          />
          <Chip
            selected={feed.options.includeMuted}
            label='Muted'
            variant='filter'
            icon={<IconVolumeOff {...iconProps} />}
            onClick={() => feed.options.toggle('includeMuted')}
          />
        </Stack>
        <Stack>
          <Chip label='Reset' variant='assist' onClick={() => feed.resetFilter()} />
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
