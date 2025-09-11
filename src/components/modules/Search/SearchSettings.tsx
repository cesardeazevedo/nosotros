import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import type { FeedSearch } from '@/hooks/state/useSearchFeed'
import { spacing } from '@/themes/spacing.stylex'
import type { IconProps } from '@tabler/icons-react'
import { IconArticle, IconMessage2, IconPhoto, IconUser } from '@tabler/icons-react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { FeedSettingsRelays } from '../Feed/settings/FeedSettingsRelays'
import { FeedSettingsSafety } from '../Feed/settings/FeedSettingsSafety'

const iconProps: IconProps = {
  size: 18,
  strokeWidth: '1.5',
}

type Props = {
  feed: FeedSearch
}

export const SearchSettings = memo(function SearchSettings(props: Props) {
  const { feed } = props
  return (
    <>
      <html.div style={styles.root}>
        <Divider />
        <Stack horizontal={false} sx={styles.content} gap={2}>
          <Stack horizontal={false} gap={0.5}>
            <Text variant='label' size='lg' sx={styles.label}>
              Search Content
            </Text>
            <Stack gap={0.5} wrap>
              <Chip
                variant='filter'
                label='Users'
                selected={feed.hasKind(Kind.Metadata)}
                icon={<IconUser {...iconProps} />}
                onClick={() => feed.toggleKind(Kind.Metadata)}
              />
              <Chip
                variant='filter'
                label='Text Notes'
                selected={feed.hasKind(Kind.Text)}
                icon={<IconMessage2 {...iconProps} />}
                onClick={() => feed.toggleKind(Kind.Text)}
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
              {/* <Chip label='Reset' variant='assist' onClick={() => feed.resetFilter()} /> */}
            </Stack>
          </Stack>
          {feed && (
            <>
              <FeedSettingsSafety feed={feed} />
              <FeedSettingsRelays feed={feed} name='Search relays' />
            </>
          )}
        </Stack>
      </html.div>
    </>
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding1,
  },
  root: {},
  content: {
    padding: spacing.padding2,
  },
  label: {
    marginLeft: spacing.margin1,
  },
})
