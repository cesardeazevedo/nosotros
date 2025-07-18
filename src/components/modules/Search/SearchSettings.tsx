import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import type { FeedModule } from '@/stores/modules/feed.module'
import { spacing } from '@/themes/spacing.stylex'
import type { IconProps } from '@tabler/icons-react'
import { IconArticle, IconMessage2, IconPhoto, IconUser } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { FeedSettingsRelays } from '../Feed/settings/FeedSettingsRelays'
import { FeedSettingsSafety } from '../Feed/settings/FeedSettingsSafety'
import { SearchHeader } from './SearchHeader'

const iconProps: IconProps = {
  size: 18,
  strokeWidth: '1.5',
}

type Props = {
  module?: FeedModule
  renderSearchField?: boolean
}

export const SearchSettings = observer(function SearchSettings(props: Props) {
  const { module, renderSearchField = true } = props
  return (
    <>
      {renderSearchField && (
        <Stack sx={styles.header} justify='stretch'>
          <SearchHeader module={module} />
        </Stack>
      )}
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
                selected={module?.feed.hasKind(Kind.Metadata)}
                icon={<IconUser {...iconProps} />}
                onClick={() => module?.feed.toggleKind(Kind.Metadata)}
              />
              <Chip
                variant='filter'
                label='Text Notes'
                selected={module?.feed.hasKind(Kind.Text)}
                icon={<IconMessage2 {...iconProps} />}
                onClick={() => module?.feed.toggleKind(Kind.Text)}
              />
              <Chip
                label='Media'
                variant='filter'
                selected={module?.feed.hasKind(Kind.Media)}
                icon={<IconPhoto {...iconProps} />}
                onClick={() => module?.feed.toggleKind(Kind.Media)}
              />
              <Chip
                selected={module?.feed.hasKind(Kind.Article)}
                variant='filter'
                icon={<IconArticle {...iconProps} />}
                label='Articles'
                onClick={() => module?.feed.toggleKind(Kind.Article)}
              />
              {/* <Chip label='Reset' variant='assist' onClick={() => feed.resetFilter()} /> */}
            </Stack>
          </Stack>
          {module?.feed && (
            <>
              <FeedSettingsSafety feed={module.feed} />
              <FeedSettingsRelays feed={module.feed} name='Search relays' />
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
