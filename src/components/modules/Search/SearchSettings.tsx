import { Chip } from '@/components/ui/Chip/Chip'
import { RelayInputChip } from '@/components/elements/Relays/RelayInputChip'
import { RelaySelectPopover } from '@/components/elements/Relays/RelaySelectPopover'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import type { FeedState } from '@/hooks/state/useFeed'
import { searchRoute } from '@/Router'
import { spacing } from '@/themes/spacing.stylex'
import type { IconProps } from '@tabler/icons-react'
import { IconArticle, IconBlur, IconMessage2, IconPhoto, IconUser } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

const iconProps: IconProps = {
  size: 18,
  strokeWidth: '1.5',
}

type Props = {
  feed: FeedState
  variant?: 'popover' | 'rail'
}

export const SearchSettings = memo(function SearchSettings(props: Props) {
  const { feed, variant = 'popover' } = props
  const navigate = useNavigate()
  const search = searchRoute.useSearch()
  const selectedKinds = [search.kind ?? feed.filter.kinds ?? []].flat()
  const network = search.network || 'STALE_WHILE_REVALIDATE'

  const updateSearch = (updater: (prev: typeof search) => typeof search) => {
    navigate({
      to: '/search',
      search: (prev) => updater(prev as typeof search),
    })
  }

  const toggleKind = (kind: Kind) => {
    updateSearch((prev) => {
      const kinds = [prev.kind ?? feed.filter.kinds ?? []].flat()
      const nextKinds = kinds.includes(kind) ? kinds.filter((value) => value !== kind) : [...kinds, kind]
      return {
        ...prev,
        kind: nextKinds.length === 0 ? undefined : nextKinds.length === 1 ? nextKinds[0] : nextKinds,
      }
    })
  }

  const toggleBlured = () => {
    updateSearch((prev) => ({
      ...prev,
      blured: prev.blured ? undefined : true,
    }))
  }

  const removeRelay = (relay: string) => {
    updateSearch((prev) => {
      const relays = (feed.options.ctx.relays || []).filter((url) => url !== relay)
      return {
        ...prev,
        relay: relays.length === 0 ? undefined : relays.length === 1 ? relays[0] : relays,
      }
    })
  }

  const addRelay = (relay: string) => {
    updateSearch((prev) => {
      const relays = Array.from(new Set([...(feed.options.ctx.relays || []), relay]))
      return {
        ...prev,
        relay: relays.length === 1 ? relays[0] : relays,
      }
    })
  }

  const setNetwork = (network: 'STALE_WHILE_REVALIDATE' | 'REMOTE_ONLY' | 'CACHE_ONLY') => {
    updateSearch((prev) => ({
      ...prev,
      network,
    }))
  }

  return (
    <>
      <html.div style={styles.root}>
        {variant === 'popover' && <Divider />}
        <Stack horizontal={false} sx={styles.content} gap={2}>
          <Stack horizontal={false} gap={0.5}>
            <Text variant='label' size='lg' sx={styles.label}>
              Search Content
            </Text>
            <Stack gap={0.5} wrap>
              <Chip
                variant='filter'
                label='Users'
                selected={selectedKinds.includes(Kind.Metadata)}
                icon={<IconUser {...iconProps} />}
                onClick={() => toggleKind(Kind.Metadata)}
              />
              <Chip
                variant='filter'
                label='Text Notes'
                selected={selectedKinds.includes(Kind.Text)}
                icon={<IconMessage2 {...iconProps} />}
                onClick={() => toggleKind(Kind.Text)}
              />
              <Chip
                label='Media'
                variant='filter'
                selected={selectedKinds.includes(Kind.Media)}
                icon={<IconPhoto {...iconProps} />}
                onClick={() => toggleKind(Kind.Media)}
              />
              <Chip
                selected={selectedKinds.includes(Kind.Article)}
                variant='filter'
                icon={<IconArticle {...iconProps} />}
                label='Articles'
                onClick={() => toggleKind(Kind.Article)}
              />
            </Stack>
          </Stack>
          <Stack horizontal={false} gap={0.5}>
            <Text variant='label' size='lg' sx={styles.label}>
              Source
            </Text>
            <Stack gap={0.5} wrap>
              <Chip
                variant='filter'
                label='All'
                selected={network === 'STALE_WHILE_REVALIDATE'}
                onClick={() => setNetwork('STALE_WHILE_REVALIDATE')}
              />
              <Chip
                variant='filter'
                label='Relays Only'
                selected={network === 'REMOTE_ONLY'}
                onClick={() => setNetwork('REMOTE_ONLY')}
              />
              <Chip
                variant='filter'
                label='Local Only'
                selected={network === 'CACHE_ONLY'}
                onClick={() => setNetwork('CACHE_ONLY')}
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
                selectedIcon={null}
                label='Blur Images'
                onClick={toggleBlured}
              />
            </Stack>
          </Stack>
          <Stack horizontal={false} gap={0.5}>
            <Text variant='label' size='lg' sx={styles.label}>
              Search relays
            </Text>
            <Stack gap={0.5} wrap>
              {feed.options.ctx.relays?.map((relay) => (
                <RelayInputChip key={relay} url={relay} onDelete={() => removeRelay(relay)} />
              ))}
              <RelaySelectPopover label='Add Search relay' onSubmit={(relay) => addRelay(relay)} />
            </Stack>
          </Stack>
        </Stack>
      </html.div>
    </>
  )
})

const styles = css.create({
  root: {},
  content: {
    padding: spacing.padding2,
  },
  label: {
    marginLeft: spacing.margin1,
  },
})
