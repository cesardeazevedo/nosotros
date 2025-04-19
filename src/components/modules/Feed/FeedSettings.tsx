import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconArticle, IconMessage2, IconPhoto, IconShare3 } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { FeedSettingsRelays } from './settings/FeedSettingsRelays'
import { FeedSettingsSafety } from './settings/FeedSettingsSafety'

const iconProps = {
  size: 18,
  strokeWidth: '1.5',
}

export type Props = {
  feed: FeedStore
  renderRelaySettings?: boolean
}

export const FeedSettings = observer(function FeedSettings(props: Props) {
  const { feed, renderRelaySettings = false } = props
  return (
    <html.div style={styles.root}>
      <Divider />
      <Stack horizontal={false} sx={styles.content} gap={1}>
        <Text variant='label' size='lg' sx={styles.label}>
          Content
        </Text>
        <Stack gap={0.5} wrap>
          <Chip
            variant='filter'
            label='Text Notes'
            selected={feed.hasKind(Kind.Text)}
            icon={<IconMessage2 {...iconProps} />}
            onClick={() => feed.toggleKind(Kind.Text)}
          />
          <Chip
            label='Reposts'
            variant='filter'
            selected={feed.hasKind(Kind.Repost)}
            icon={<IconShare3 {...iconProps} />}
            onClick={() => feed.toggleKind(Kind.Repost)}
          />
          <Chip
            label='Media'
            variant='filter'
            selected={feed.hasKind(Kind.Media)}
            icon={<IconPhoto {...iconProps} />}
            onClick={() => feed.toggleKind(Kind.Media)}
          />
          <Chip
            selected={feed.hasKind(Kind.Article)}
            variant='filter'
            icon={<IconArticle {...iconProps} />}
            label='Articles'
            onClick={() => feed.toggleKind(Kind.Article)}
          />
          {/* <Chip */}
          {/*   label='Highlights' */}
          {/*   variant='filter' */}
          {/*   icon={<IconHighlight {...iconProps} />} */}
          {/*   selected={feed.hasKind(Kind.Highlight)} */}
          {/*   onClick={() => feed.toggleKind(Kind.Highlight)} */}
          {/* /> */}
          {/* <Chip variant='filter' icon={<IconBroadcast {...iconProps} />} label='Live Events' /> */}
          <Chip label='Reset' variant='assist' onClick={() => feed.resetFilter()} />
        </Stack>
        <FeedSettingsSafety feed={feed} />
        {renderRelaySettings && <FeedSettingsRelays feed={feed} />}
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
  divider: {
    height: 12,
    alignSelf: 'center',
    marginInline: spacing.margin1,
  },
})
