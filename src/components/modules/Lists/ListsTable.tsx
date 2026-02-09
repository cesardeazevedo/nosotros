import { listFormDialogAtom } from '@/atoms/dialog.atoms'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { KIND_LABELS, LIST_KIND_MAP } from '@/constants/kinds'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useFeedState } from '@/hooks/state/useFeed'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useSM } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconFilter, IconFilterFilled, IconLayoutGrid, IconLayoutRows, IconLockOpen, IconPlus } from '@tabler/icons-react'
import { useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { Feed } from '../Feed/Feed'
import { ListCard } from './ListCard'
import { ListCardLoading } from './ListCardLoading'
import { ListRow } from './ListRow'
import { ListRowLoading } from './ListRowLoading'

type Props = {
  module: FeedModule
  title?: string
  selectedKinds: number[]
  onKindsChange: (kinds: number[]) => void
  initialLayout?: 'table' | 'cards'
  singleColumnCards?: boolean
}

export const ListsTable = (props: Props) => {
  const {
    module,
    title = 'Your Lists',
    selectedKinds,
    onKindsChange,
    initialLayout = 'table',
    singleColumnCards = false,
  } = props
  const openListForm = useSetAtom(listFormDialogAtom)
  const [layout, setLayout] = useState<'table' | 'cards'>(initialLayout)
  const [filterOpen, setFilterOpen] = useState(false)
  const [customKindInput, setCustomKindInput] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [decryptAllVersion, setDecryptAllVersion] = useState(0)
  const isMobile = useSM()
  const pubkey = useCurrentPubkey()
  const feed = useFeedState(module)
  const list = useMemo(
    () => feed.query.data?.pages.flat().slice(0, feed.pageSize) || [],
    [feed.pageSize, feed.query.data?.pages],
  )
  const lastId = list[list.length - 1]?.id

  const kindOptions = useMemo(() => {
    const baseKinds = Object.entries(KIND_LABELS)
      .map(([kind, label]) => ({ kind: Number(kind), label }))
      .filter((option) => LIST_KIND_MAP[option.kind])
    const customKinds = selectedKinds
      .filter((kind) => !KIND_LABELS[kind])
      .map((kind) => ({ kind, label: `Kind ${kind}` }))
    return [...baseKinds, ...customKinds].toSorted((a, b) => a.kind - b.kind)
  }, [selectedKinds])

  const toggleKind = (kind: number) => {
    if (selectedKinds.includes(kind)) {
      onKindsChange(selectedKinds.filter((value) => value !== kind))
      return
    }
    onKindsChange([...selectedKinds, kind])
  }

  const addCustomKind = () => {
    const parsed = Number(customKindInput)
    if (Number.isNaN(parsed)) return
    if (!selectedKinds.includes(parsed)) {
      onKindsChange([...selectedKinds, parsed])
    }
    setCustomKindInput('')
    setAddOpen(false)
  }

  return (
    <>
      <>
        <Stack horizontal={false}>
          <Stack sx={styles.header} justify='space-between' align='center'>
            <Text variant='title' size='lg'>
              {title}
            </Text>
            <Stack gap={1} align='center'>
              {module.scope === 'self' && (
                <Chip
                  selected={false}
                  selectedIcon={null}
                  icon={<IconLockOpen size={18} strokeWidth='1.5' />}
                  label=''
                  onClick={() => {
                    setDecryptAllVersion((value) => value + 1)
                  }}
                />
              )}
              <Stack gap={0.5} align='center'>
                <Chip
                  selected={layout === 'table'}
                  onClick={() => setLayout('table')}
                  icon={<IconLayoutRows size={18} strokeWidth='1.5' />}
                  selectedIcon={null}
                  label=''
                />
                <Chip
                  selected={layout === 'cards'}
                  onClick={() => setLayout('cards')}
                  icon={<IconLayoutGrid size={18} strokeWidth='1.5' />}
                  selectedIcon={null}
                  label=''
                />
              </Stack>
              <Chip
                variant='filter'
                selected={filterOpen}
                onClick={() => setFilterOpen((prev) => !prev)}
                icon={<IconFilter size={18} strokeWidth='1.5' />}
                selectedIcon={<IconFilterFilled size={18} strokeWidth='1.5' />}
                label=''
              />
              <Button variant='filled' onClick={() => openListForm({})}>
                Create List
              </Button>
            </Stack>
          </Stack>
          <Divider />
          <Expandable expanded={filterOpen}>
            <Stack horizontal={false} gap={1} sx={styles.filterBar}>
              <Stack gap={0.5} wrap sx={styles.filterChips}>
                {kindOptions.map((option) => (
                  <Chip
                    key={option.kind}
                    selected={selectedKinds.includes(option.kind)}
                    onClick={() => toggleKind(option.kind)}
                    label={`${option.label} (${option.kind})`}
                  />
                ))}
                <PopoverBase
                  opened={addOpen}
                  onClose={() => setAddOpen(false)}
                  placement='bottom-start'
                  openEvents={{ click: true }}
                  contentRenderer={() => (
                    <PaperContainer maxWidth='md' sx={styles.addMenu}>
                      <Stack gap={1} align='center'>
                        <TextField
                          label='Custom kind'
                          value={customKindInput}
                          shrink
                          placeholder='Enter kind'
                          onChange={(event) => setCustomKindInput(event.currentTarget.value)}
                        />
                        <Button variant='filled' onClick={addCustomKind}>
                          Add
                        </Button>
                      </Stack>
                    </PaperContainer>
                  )}>
                  {({ setRef, getProps }) => (
                    <span ref={setRef} {...getProps()}>
                      <Chip
                        icon={<IconPlus size={16} strokeWidth='2' />}
                        label='Add kind'
                        onClick={() => setAddOpen(true)}
                      />
                    </span>
                  )}
                </PopoverBase>
              </Stack>
            </Stack>
          </Expandable>
        </Stack>
        <Feed
          feed={feed}
          loading={
            feed.query.isFetching ? (
              layout === 'cards' ? (
                <html.div
                  style={[styles.cardGrid, singleColumnCards && styles.cardGrid$single, isMobile && styles.cardGrid$mobile]}>
                  <ListCardLoading rows={isMobile ? 3 : 6} />
                </html.div>
              ) : (
                <ListRowLoading rows={4} />
              )
            ) : (
              <></>
            )
          }
          header={
            layout === 'table' ? (
              <html.div style={styles.tableHeader}>
                <html.div style={[styles.cell, styles.cellFirst]}>
                  <Text variant='label' size='md'>
                    Author
                  </Text>
                </html.div>
                <html.div style={styles.cell}>
                  <Text variant='label' size='md'>
                    Kind
                  </Text>
                </html.div>
                <html.div style={styles.cell}>
                  <Text variant='label' size='md'>
                    Title
                  </Text>
                </html.div>
                <html.div style={styles.cell}>
                  <Text variant='label' size='md'>
                    Tags
                  </Text>
                </html.div>
                <html.div style={[styles.cell, styles.cellLast]}>
                  <Text variant='label' size='md'>
                    Members
                  </Text>
                </html.div>
                <html.div style={styles.cell} />
              </html.div>
            ) : null
          }
          wrapper={(children) =>
            layout === 'cards' ? (
              list.length ? (
                <html.div
                  style={[styles.cardGrid, singleColumnCards && styles.cardGrid$single, isMobile && styles.cardGrid$mobile]}>
                  {children}
                </html.div>
              ) : null
            ) : (
              <html.div style={styles.table}>{children}</html.div>
            )
          }
          render={(event) =>
            layout === 'cards' ? (
              <ListCard
                event={event}
                onEdit={(item) => openListForm(item)}
                canEdit={event.pubkey === pubkey}
                decryptAllSignal={decryptAllVersion}
              />
            ) : (
              <ListRow
                event={event}
                isLast={event.id === lastId}
                onEdit={(item) => openListForm(item)}
                canEdit={event.pubkey === pubkey}
                decryptAllSignal={decryptAllVersion}
              />
            )
          }
        />
      </>
    </>
  )
}

const styles = css.create({
  header: {
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '220px 180px 1fr 120px 180px 40px',
    gap: spacing.padding1,
    paddingBlock: spacing.padding1,
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.padding1,
  },
  cellFirst: {
    paddingInlineStart: spacing.padding2,
  },
  cellLast: {
    paddingInlineEnd: spacing.padding2,
    justifyContent: 'flex-end',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: spacing.padding2,
    padding: spacing.padding2,
  },
  cardGrid$mobile: {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
  cardGrid$single: {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
  filterBar: {
    padding: spacing.padding1,
  },
  filterChips: {
    paddingInline: spacing.padding1,
  },
  addMenu: {
    padding: spacing.padding1,
  },
})
