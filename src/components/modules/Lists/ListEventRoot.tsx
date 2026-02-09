import { PostHeader } from '@/components/elements/Posts/PostHeader'
import { UserRoot } from '@/components/elements/User/UserRoot'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind, KIND_LABELS } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventDecryptedTags } from '@/hooks/useEventDecrypt'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconLock } from '@tabler/icons-react'
import { memo, useMemo, useState } from 'react'
import { css } from 'react-strict-dom'
import { ListFeedLink } from './ListFeedLink'

type Props = {
  event: NostrEventDB
}

type ListTagItem = {
  tag: string
  value?: string
  relay?: string
  privateTag: boolean
}

export const ListEventRoot = memo(function ListEventRoot(props: Props) {
  const { event } = props
  const [limit, setLimit] = useState(50)
  const decryptedTags = useEventDecryptedTags(event)
  const title = event.tags.find((tag) => tag[0] === 'title')?.[1]
  const description = event.tags.find((tag) => tag[0] === 'description')?.[1]
  const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1]
  const label = title || dTag || '-'

  const displayKind = KIND_LABELS[event.kind]
    ? `${KIND_LABELS[event.kind]} (${event.kind})`
    : `Kind ${event.kind}`

  const canSeeFeed = useMemo(() => {
    switch (event.kind) {
      case Kind.Mutelist:
      case Kind.PinnedNotes:
      case Kind.BookmarkList:
      case Kind.MediaFollows:
      case Kind.FollowSets:
      case Kind.RelaySets:
      case Kind.BookmarkSets:
      case Kind.StarterPack:
      case Kind.MediaStarterPack: {
        return true
      }
      default: {
        return false
      }
    }
  }, [event.kind])

  const listTags = useMemo(() => {
    const hidden = ['title', 'description', 'd', 'client', 'alt']
    const entries = new Map<string, ListTagItem>()
    const visiblePublic = event.tags.filter((tag) => !hidden.includes(tag[0]))
    const visiblePrivate = (decryptedTags || []).filter((tag) => !hidden.includes(tag[0]))

    for (const [tag, value, relay] of visiblePublic) {
      const key = `${tag}:${value || ''}:${relay || ''}`
      entries.set(key, { tag, value, relay, privateTag: false })
    }

    for (const [tag, value, relay] of visiblePrivate) {
      const key = `${tag}:${value || ''}:${relay || ''}`
      if (!entries.has(key)) {
        entries.set(key, { tag, value, relay, privateTag: true })
      }
    }

    return [...entries.values()]
  }, [decryptedTags, event.tags])

  const limitedTags = useMemo(() => listTags.slice(0, limit), [listTags, limit])

  return (
    <NoteProvider value={{ event }}>
      <PostHeader event={event} />
      <Stack sx={styles.header} justify='space-between'>
        <Stack horizontal={false} gap={0.5} sx={styles.headerContent}>
          <Text variant='headline' size='md'>
            {displayKind}
          </Text>
          <Text variant='title' size='md'>
            {label}
          </Text>
          {description && (
            <Text variant='body' size='sm' sx={styles.description}>
              {description}
            </Text>
          )}
        </Stack>
        {canSeeFeed && (
          <Stack sx={styles.actions}>
            <ListFeedLink event={event}>
              <Button variant='filledTonal'>See Feed</Button>
            </ListFeedLink>
          </Stack>
        )}
      </Stack>
      <Divider />
      <Stack horizontal={false} sx={styles.content}>
        {limitedTags.map(({ tag, value, relay, privateTag }, index) => {
          const key = [tag, value, relay].filter(Boolean).join(':')
          if (tag === 'p') {
            if (!value) {
              return null
            }
            return <UserRoot border key={key} pubkey={value} />
          }
          const withDivider = limitedTags.length > 1 && index !== limitedTags.length - 1
          return (
            <Stack key={key} sx={[styles.tag, withDivider && styles.tag$divider]} justify='space-between'>
              <Stack horizontal={false} gap={0.5} sx={styles.tagMeta}>
                <Stack gap={0.5} align='center'>
                  <Text variant='label' size='sm' sx={styles.tagChip}>
                    {tag === 't' ? 'Topic' : tag}
                  </Text>
                  {privateTag && (
                    <Stack gap={0.5} align='center' sx={styles.privateBadge}>
                      <IconLock size={12} strokeWidth='1.8' />
                      <Text variant='label' size='sm' sx={styles.privateBadgeText}>
                        private
                      </Text>
                    </Stack>
                  )}
                </Stack>
                <Text variant='title' size='sm' sx={styles.tagValue}>
                  {value}
                </Text>
              </Stack>
              {relay && (
                <Text variant='body' size='sm' sx={styles.relay}>
                  {relay}
                </Text>
              )}
            </Stack>
          )
        })}
      </Stack>
      {listTags.length > limit && (
        <Stack sx={styles.footer} justify='center'>
          <Button variant='outlined' onClick={() => setLimit((prev) => prev + 50)}>
            Load More
          </Button>
        </Stack>
      )}
    </NoteProvider>
  )
})

const styles = css.create({
  header: {
    paddingInlineEnd: spacing.padding2,
    paddingInlineStart: spacing.padding3,
    paddingBlock: spacing.padding2,
    flexWrap: 'wrap',
    rowGap: spacing.padding1,
  },
  headerContent: {
    minWidth: 0,
    flex: 1,
  },
  actions: {
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  description: {
    color: palette.onSurfaceVariant,
  },
  content: {},
  footer: {
    paddingBlock: spacing.padding4,
  },
  tag: {
    padding: spacing.padding2,
  },
  tag$divider: {
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
  },
  tagMeta: {
    minWidth: 0,
    flex: 1,
  },
  tagChip: {
    border: '1px solid',
    borderColor: palette.outlineVariant,
    borderRadius: 999,
    paddingInline: spacing.padding1,
    paddingBlock: spacing['padding0.5'],
    color: palette.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    alignSelf: 'flex-start',
  },
  relay: {
    color: palette.onSurfaceVariant,
  },
  tagValue: {
    wordBreak: 'break-word',
  },
  privateBadge: {
    border: '1px solid',
    borderColor: palette.warning,
    borderRadius: 999,
    paddingInline: spacing['padding0.5'],
    paddingBlock: spacing['padding0.5'],
    color: palette.warning,
  },
  privateBadgeText: {
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
})
