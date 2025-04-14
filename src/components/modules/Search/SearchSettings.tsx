import { RelayInputChip } from '@/components/elements/Relays/RelayInputChip'
import { RelaySelectPopover } from '@/components/elements/Relays/RelaySelectPopover'
import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import type { FeedModule } from '@/stores/modules/feed.module'
import { spacing } from '@/themes/spacing.stylex'
import type { IconProps } from '@tabler/icons-react'
import { IconArticle, IconBlur, IconMessage2, IconPhoto, IconServerBolt, IconUser } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { useSearchChange } from './hooks/useSearchChange'

const iconProps: IconProps = {
  size: 18,
  strokeWidth: '1.5',
}

type Props = {
  module: FeedModule
}

export const SearchSettings = observer(function SearchSettings(props: Props) {
  const { module } = props
  const feed = module.feed
  const searchRef = useRef<HTMLInputElement>(null)
  const onChange = useSearchChange(true)
  return (
    <>
      <Stack sx={styles.header} justify='space-between'>
        <SearchField
          ref={searchRef}
          placeholder='Search on nostr'
          defaultValue={module.feed.filter.search}
          onChange={(e) => onChange(e.target.value)}
        />
      </Stack>
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
                label='Relays'
                selected={feed.hasKind(Kind.RelayDiscovery)}
                icon={<IconServerBolt {...iconProps} />}
                onClick={() => feed.toggleKind(Kind.RelayDiscovery)}
              />
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
              <Chip
                label='Reset'
                variant='assist'
                // icon={<IconHighlight {...iconProps} />}
                // selected={feed.hasKind(Kind.Highlight)}
                onClick={() => feed.resetFilter()}
              />
            </Stack>
          </Stack>
          <Stack horizontal={false} gap={0.5}>
            <Text variant='label' size='lg' sx={styles.label}>
              Safety
            </Text>
            <Stack gap={0.5} wrap>
              <Chip
                selected={feed.blured}
                variant='filter'
                icon={<IconBlur {...iconProps} />}
                label='Blur Images'
                onClick={() => feed.toggle('blured')}
              />
            </Stack>
          </Stack>
          <Stack horizontal={false} gap={0.5}>
            <Text variant='label' size='lg' sx={styles.label}>
              Search relays
            </Text>
            <Stack gap={0.5} wrap>
              {module.feed.context.relays?.map((relay) => (
                <RelayInputChip key={relay} url={relay} onDelete={() => module.feed.removeRelay(relay)} />
              ))}
              <RelaySelectPopover label='Add Search Relay' onSubmit={(relay) => module.feed.addRelay(relay)} />
            </Stack>
          </Stack>
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
