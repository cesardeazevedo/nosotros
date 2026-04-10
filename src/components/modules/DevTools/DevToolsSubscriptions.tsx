import type { DevtoolsSubscriptionGroup } from '@/atoms/devtools.atoms'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { DevToolsMiniChip } from './DevToolsMiniChip'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconArrowDown, IconArrowUp, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { memo, useEffect, useMemo, useState } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  subscriptions: DevtoolsSubscriptionGroup[]
  selectedGroupId: string | null
  onSelectGroup: (id: string) => void
}

const PAGE_SIZE = 80

export const DevToolsSubscriptions = memo(function DevToolsSubscriptions(props: Props) {
  const { subscriptions, selectedGroupId, onSelectGroup } = props
  const showTitle = useMediaQuery('(min-width: 1630px)')
  const [sortField, setSortField] = useState<'time' | 'events'>('events')
  const [stateFilter, setStateFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [subIdQuery, setSubIdQuery] = useState('')
  const [kindQuery, setKindQuery] = useState('')
  const [hideIdle, setHideIdle] = useState(false)
  const [limit, setLimit] = useState(PAGE_SIZE)

  const preview = useMemo(() => {
    const filtered =
      stateFilter === 'all' ? subscriptions : subscriptions.filter((entry) => entry.state === stateFilter)
    const filteredByIdle = hideIdle ? filtered.filter((entry) => entry.state !== 'idle') : filtered
    const subIdSearch = subIdQuery.trim().toLowerCase()
    const kindSearches = kindQuery
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    const filteredBySearch = filteredByIdle.filter((entry) => {
      const hasSubId = !subIdSearch || (entry.ctx.subId || '').toLowerCase().includes(subIdSearch)
      const hasKind =
        kindSearches.length === 0 ||
        kindSearches.some((search) => (entry.filter.kinds || []).some((kind) => String(kind) === search))
      return hasSubId && hasKind
    })
    const sorted = [...filteredBySearch].sort((a, b) => {
      const aValue = sortField === 'time' ? a.createdAt : a.children.reduce((acc, child) => acc + child.eventCount, 0)
      const bValue = sortField === 'time' ? b.createdAt : b.children.reduce((acc, child) => acc + child.eventCount, 0)
      return bValue - aValue
    })
    return sorted
  }, [sortField, stateFilter, subscriptions, subIdQuery, kindQuery, hideIdle])
  const visible = useMemo(() => preview.slice(0, limit), [preview, limit])
  const canLoadMore = visible.length < preview.length

  useEffect(() => {
    setLimit(PAGE_SIZE)
  }, [sortField, stateFilter, subIdQuery, kindQuery, hideIdle])

  return (
    <Stack horizontal={false} sx={styles.root}>
      <Stack sx={styles.header} justify='space-between'>
        <Stack sx={styles.head} justify='space-between'>
          <Stack grow>
            {showTitle && (
              <Text size='lg' variant='title' sx={styles.title}>
                Subscriptions
              </Text>
            )}
            <Stack gap={0.5} justify='flex-end'>
              <SearchField
                leading={false}
                autoFocus={false}
                placeholder='Search'
                sx={styles.searchSubId}
                value={subIdQuery}
                onChange={(event) => setSubIdQuery(event.currentTarget.value)}
              />
              <SearchField
                leading={false}
                autoFocus={false}
                placeholder='Kind'
                sx={styles.searchKind}
                value={kindQuery}
                onChange={(event) => setKindQuery(event.currentTarget.value)}
              />
            </Stack>
          </Stack>
          <Stack gap={0.5} sx={styles.filters}>
            <Chip variant='filter' label='All' selected={stateFilter === 'all'} onClick={() => setStateFilter('all')} />
            <Chip
              variant='filter'
              label='Open'
              selected={stateFilter === 'open'}
              onClick={() => setStateFilter('open')}
            />
            <Chip
              variant='filter'
              label='Closed'
              selected={stateFilter === 'closed'}
              onClick={() => setStateFilter('closed')}
            />
            <Chip
              variant='filter'
              label='Hide idle'
              selected={hideIdle}
              onClick={() => setHideIdle((value) => !value)}
            />
            <Popover
              placement='bottom-end'
              contentRenderer={({ close }) => (
                <MenuList surface='surfaceContainerLow'>
                  <MenuItem
                    label='Sort by time'
                    onClick={() => {
                      setSortField('time')
                      close()
                    }}
                  />
                  <MenuItem
                    label='Sort by total events'
                    onClick={() => {
                      setSortField('events')
                      close()
                    }}
                  />
                </MenuList>
              )}>
              {({ getProps, open, setRef }) => (
                <html.div
                  {...getProps()}
                  ref={setRef as never}
                  onClick={(event) => {
                    event.stopPropagation()
                    open()
                  }}>
                  <Chip variant='filter' label={sortField === 'time' ? 'Sort by time' : 'Sort by total events'} />
                </html.div>
              )}
            </Popover>
          </Stack>
        </Stack>
      </Stack>
      <Divider />
      <Stack horizontal={false} sx={styles.body}>
        {visible.map((entry) => {
          const isSelected = selectedGroupId === entry.id
          const totalEvents = entry.children.reduce((acc, child) => acc + child.eventCount, 0)
          const stateLabel = entry.state === 'open' && entry.ctx.closeOnEose === false ? 'live' : entry.state
          const stateTone = entry.state === 'open' ? 'primary' : 'default'
          return (
            <Stack
              key={entry.id}
              horizontal={false}
              sx={[styles.item, isSelected && styles.item$selected]}
              onClick={() => onSelectGroup(entry.id)}>
              <Stack justify='space-between' sx={styles.row}>
                <Stack gap={1}>
                  <Text size='lg' sx={styles.count}>
                    {entry.children.length}
                  </Text>
                  <Text size='lg' sx={styles.id}>
                    {entry.ctx.subId || '-'}
                  </Text>
                </Stack>
                <Stack gap={0.5} sx={styles.meta}>
                  <DevToolsMiniChip>{totalEvents} events</DevToolsMiniChip>
                  <DevToolsMiniChip>Kinds: {entry.filter.kinds?.join(', ') || '-'}</DevToolsMiniChip>
                </Stack>
                <html.span style={styles.stateChip}>
                  <DevToolsMiniChip tone={stateTone} uppercase>
                    {stateLabel}
                  </DevToolsMiniChip>
                </html.span>
              </Stack>
            </Stack>
          )
        })}
        {canLoadMore && (
          <Stack sx={styles.loadMore}>
            <Button variant='filledTonal' onClick={() => setLimit((current) => current + PAGE_SIZE)}>
              Load more
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    alignSelf: 'stretch',
  },
  header: {
    padding: spacing.padding2,
    alignItems: 'center',
  },
  head: {
    width: '100%',
    alignItems: 'center',
    height: 28,
  },
  searchSubId: {
    width: 160,
    height: 32,
    borderRadius: shape.md,
  },
  searchKind: {
    width: 120,
    height: 32,
    borderRadius: shape.md,
  },
  body: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    alignSelf: 'stretch',
    overflow: 'auto',
    paddingBlock: spacing.padding2,
    paddingLeft: spacing.padding2,
    paddingRight: spacing.padding3,
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
  item: {
    border: '1px solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.lg,
    padding: spacing.padding1,
    marginBottom: spacing.margin1,
    cursor: 'pointer',
  },
  item$selected: {
    borderColor: palette.primary,
    backgroundColor: palette.surfaceContainerLow,
  },
  row: {
    width: '100%',
    alignItems: 'center',
  },
  count: {
    color: palette.onSurfaceVariant,
    width: 36,
    textAlign: 'center',
  },
  filters: {
    marginLeft: 4,
  },
  meta: {
    marginInlineStart: 'auto',
    alignItems: 'center',
  },
  id: {},
  kinds: {
    border: '1px solid',
    borderColor: palette.outline,
    color: palette.onSurfaceVariant,
    borderRadius: 999,
    paddingInline: spacing.padding1,
    paddingBlock: 2,
    fontSize: 12,
    fontWeight: 700,
  },
  stateChip: {
    marginInlineStart: spacing.margin1,
  },
  loadMore: {
    paddingTop: spacing.padding1,
    justifyContent: 'center',
    width: '100%',
  },
})
