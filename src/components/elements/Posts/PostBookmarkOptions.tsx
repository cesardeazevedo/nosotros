import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { DialogSheet } from '@/components/elements/Layouts/Dialog'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { invalidateNip51Queries } from '@/hooks/query/invalidations'
import { eventQueryOptions } from '@/hooks/query/useQueryBase'
import { useCurrentPubkey, useCurrentSigner } from '@/hooks/useAuth'
import { useEventDecryptedTags } from '@/hooks/useEventDecrypt'
import { useEventTag, useEventTags } from '@/hooks/useEventUtils'
import { publish } from '@/nostr/publish/publish'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconLock, IconX } from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import type { UnsignedEvent } from 'nostr-tools'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  open: boolean
  postId: string
  onClose: () => void
}

type BookmarkSetItemProps = {
  label?: string
  event?: NostrEventDB
  onSubmit: (event?: NostrEventDB, decryptedTags?: string[][]) => void
}

const BookmarkOptionItem = (props: BookmarkSetItemProps) => {
  const { label, event, onSubmit } = props
  const decryptedTags = useEventDecryptedTags(event)
  const eTags = useEventTags(event, 'e')
  const title = useEventTag(event, 'title')
  const dTag = useEventTag(event, 'd')
  const isPrivate = !!event?.content
  const eCount = isPrivate ? (decryptedTags || []).filter((tag) => tag[0] === 'e').length : eTags.length
  const resolvedLabel = label || title || dTag || '-'

  return (
    <ListItem
      interactive
      sx={styles.item}
      onClick={() => {
        onSubmit(event, decryptedTags)
      }}
      trailing={
        <Stack align='center' gap={1}>
          {isPrivate ? (
            <span style={{ color: palette.warning }}>
              <IconLock size={22} strokeWidth='1.5' />
            </span>
          ) : null}
          <Text variant='title' size='sm' sx={styles.count}>
            {eCount} events
          </Text>
        </Stack>
      }>
      {resolvedLabel}
    </ListItem>
  )
}

export const PostBookmarkOptions = (props: Props) => {
  const { open, onClose, postId } = props
  const pubkey = useCurrentPubkey()
  const signer = useCurrentSigner()
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const queryClient = useQueryClient()

  const bookmarksQuery = useQuery(
    eventQueryOptions<NostrEventDB[]>({
      queryKey: ['bookmark-options', pubkey],
      filter: {
        kinds: [Kind.BookmarkList, Kind.BookmarkSets],
        authors: [pubkey || ''],
        limit: 200,
      },
      enabled: !!pubkey && open,
      ctx: {
        outbox: true,
        negentropy: false,
      },
    }),
  )

  const bookmarkSets = useMemo(() => {
    const events = (bookmarksQuery.data || []).filter((event) => event.kind === Kind.BookmarkSets)
    const byD = new Map<string, NostrEventDB>()
    events.forEach((event) => {
      const d = event.tags.find((tag) => tag[0] === 'd')?.[1]
      if (!d) {
        return
      }
      const current = byD.get(d)
      if (!current || current.created_at < event.created_at) {
        byD.set(d, event)
      }
    })
    return [...byD.values()].sort((a, b) => b.created_at - a.created_at)
  }, [bookmarksQuery.data])

  const bookmarkList = useMemo(() => {
    const events = (bookmarksQuery.data || []).filter((event) => event.kind === Kind.BookmarkList)
    return events.sort((a, b) => b.created_at - a.created_at)[0]
  }, [bookmarksQuery.data])

  const { mutateAsync } = usePublishEventMutation<UnsignedEvent>({
    mutationFn:
      ({ signer: localSigner }) =>
        (newEvent) => {
          return publish(newEvent, { signer: localSigner })
        },
  })

  const invalidateListQueries = async () => {
    if (!pubkey) {
      return
    }
    await invalidateNip51Queries(queryClient, {
      pubkey,
      kind: Kind.BookmarkList,
      includeBookmarkOptions: true,
    })
  }

  const onSubmit = async (target?: NostrEventDB, decryptedTags?: string[][]) => {
    if (!pubkey || !signer) {
      return
    }

    const targetEvent = target || bookmarkList
    const isPrivate = !!targetEvent?.content

    if (!targetEvent) {
      await mutateAsync({
        kind: Kind.BookmarkList,
        pubkey,
        tags: [['e', postId]],
        content: '',
        created_at: Math.floor(Date.now() / 1000),
      })
      await invalidateListQueries()
      onClose()
      return
    }

    const publicTags = targetEvent.tags.filter((tag) => tag[0] !== 'e')

    if (isPrivate) {
      if (!decryptedTags) {
        enqueueToast({ component: 'Cannot decrypt private bookmark set', duration: 4000 })
        return
      }
      const currentIds = new Set(decryptedTags.filter((tag) => tag[0] === 'e').map((tag) => tag[1]))
      if (currentIds.has(postId)) {
        currentIds.delete(postId)
      } else {
        currentIds.add(postId)
      }
      const otherPrivateTags = decryptedTags.filter((tag) => tag[0] !== 'e')
      const nextPrivateTags = [...otherPrivateTags, ...[...currentIds].map((id) => ['e', id])]
      const encrypted = await signer.encrypt(pubkey, JSON.stringify(nextPrivateTags))
      await mutateAsync({
        kind: targetEvent.kind,
        pubkey,
        tags: publicTags,
        content: encrypted,
        created_at: Math.floor(Date.now() / 1000),
      })
      await invalidateListQueries()
      onClose()
      return
    }

    const currentIds = new Set(targetEvent.tags.filter((tag) => tag[0] === 'e').map((tag) => tag[1]))
    if (currentIds.has(postId)) {
      currentIds.delete(postId)
    } else {
      currentIds.add(postId)
    }
    const nextTags = [...publicTags, ...[...currentIds].map((id) => ['e', id])]
    await mutateAsync({
      kind: targetEvent.kind,
      pubkey,
      tags: nextTags,
      content: '',
      created_at: Math.floor(Date.now() / 1000),
    })
    await invalidateListQueries()
    onClose()
  }

  return (
    <DialogSheet open={open} onClose={onClose} maxWidth='sm'>
      <Stack horizontal={false} gap={0}>
        <Stack sx={styles.header} align='center' justify='space-between'>
          <IconButton size='md' onClick={onClose} icon={<IconX size={22} />} />
          <Text variant='title' size='lg'>
            Save Bookmark
          </Text>
          <span style={{ width: 36 }} />
        </Stack>
        <Stack horizontal={false} gap={2} sx={styles.content}>
          <Stack horizontal={false} gap={1}>
            <Text variant='label' size='md' sx={styles.sectionTitle}>
              Main Bookmark
            </Text>
            <BookmarkOptionItem
              label='Public Bookmarks'
              event={bookmarkList}
              onSubmit={(event, decryptedTags) => {
                void onSubmit(event, decryptedTags)
              }}
            />
          </Stack>
          <Stack horizontal={false} gap={1}>
            <Text variant='label' size='md' sx={styles.sectionTitle}>
              Bookmark Sets
            </Text>
            {bookmarkSets.map((set) => {
              return (
                <BookmarkOptionItem
                  key={set.id}
                  event={set}
                  onSubmit={(event, decryptedTags) => {
                    void onSubmit(event, decryptedTags)
                  }}
                />
              )
            })}
            {bookmarkSets.length === 0 ? (
              <Text variant='body' size='md' sx={styles.empty}>
                No bookmark sets yet.
              </Text>
            ) : null}
          </Stack>
        </Stack>
      </Stack>
    </DialogSheet>
  )
}

const styles = css.create({
  header: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
  content: {
    padding: spacing.padding2,
    paddingTop: spacing.padding1,
  },
  item: {
    minHeight: 56,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.md,
  },
  sectionTitle: {
    color: palette.onSurfaceVariant,
    letterSpacing: '0.06em',
  },
  count: {
    color: palette.onSurfaceVariant,
    whiteSpace: 'nowrap',
  },
  empty: {
    color: palette.onSurfaceVariant,
  },
})
