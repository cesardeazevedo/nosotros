import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { DialogSheet } from '@/components/elements/Layouts/Dialog'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { queryKeys } from '@/hooks/query/queryKeys'
import { eventQueryOptions, replaceableEventQueryOptions } from '@/hooks/query/useQueryBase'
import { useUserState } from '@/hooks/state/useUser'
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
import { css } from 'react-strict-dom'

type Props = {
  open: boolean
  targetPubkey?: string
  targetEventId?: string
  onClose: () => void
}

type MuteSetItemProps = {
  label?: string
  event?: NostrEventDB
  targetTagName: 'p' | 'e'
  targetValue?: string
  onSubmit: (event?: NostrEventDB, decryptedTags?: string[][]) => void
}

const MuteOptionItem = (props: MuteSetItemProps) => {
  const { label, event, onSubmit } = props
  const decryptedTags = useEventDecryptedTags(event)
  const pTags = useEventTags(event, 'p')
  const title = useEventTag(event, 'title')
  const dTag = useEventTag(event, 'd')
  const isPrivate = !!event?.content
  const pCount = isPrivate ? (decryptedTags ? decryptedTags.filter((tag) => tag[0] === 'p').length : undefined) : pTags.length
  const tags = isPrivate ? (decryptedTags || []) : (event?.tags || [])
  const isTargetMuted = !!props.targetValue && tags.some((tag) => tag[0] === props.targetTagName && tag[1] === props.targetValue)
  const baseLabel = label || title || dTag || '-'
  const resolvedLabel = isTargetMuted ? `Unmute from ${baseLabel}` : baseLabel

  return (
    <ListItem
      interactive
      sx={[styles.item, isTargetMuted && styles.itemError]}
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
            {pCount === undefined ? '-' : pCount} users
          </Text>
        </Stack>
      }>
      {resolvedLabel}
    </ListItem>
  )
}

export const ListMuteOptionsDialog = (props: Props) => {
  const { open, onClose, targetPubkey, targetEventId } = props
  const pubkey = useCurrentPubkey()
  const signer = useCurrentSigner()
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const queryClient = useQueryClient()
  const targetTagName = targetEventId ? 'e' : 'p'
  const targetValue = targetEventId || targetPubkey
  const targetUser = useUserState(targetPubkey)
  const targetLabel = targetEventId ? 'Note' : (targetUser.displayName || 'User')

  const muteListQuery = useQuery(
    replaceableEventQueryOptions(Kind.Mutelist, pubkey || '', {
      enabled: !!pubkey && open,
      ctx: {
        outbox: true,
        negentropy: false,
      },
    }),
  )

  const muteSetsQuery = useQuery(
    eventQueryOptions<NostrEventDB[]>({
      queryKey: queryKeys.author(pubkey || '', Kind.MuteSets),
      filter: {
        kinds: [Kind.MuteSets],
        authors: pubkey ? [pubkey] : [],
      },
      enabled: !!pubkey && open,
      ctx: {
        outbox: true,
        negentropy: false,
      },
    }),
  )

  const muteSets = [...(muteSetsQuery.data || [])]
    .reduce<Map<string, NostrEventDB>>((acc, event) => {
      const d = event.tags.find((tag) => tag[0] === 'd')?.[1] || event.id
      const current = acc.get(d)
      if (!current || current.created_at <= event.created_at) {
        acc.set(d, event)
      }
      return acc
    }, new Map())
    .values()
  const muteSetsList = [...muteSets].sort((a, b) => b.created_at - a.created_at)

  const muteList = muteListQuery.data

  const { mutateAsync } = usePublishEventMutation<UnsignedEvent>({
    mutationFn:
      ({ signer: localSigner }) =>
        (newEvent) => {
          return publish(newEvent, { signer: localSigner })
        },
  })

  const invalidateMuteQueries = async () => {
    if (!pubkey) {
      return
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.replaceable(Kind.Mutelist, pubkey) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.replaceable(Kind.MuteSets, pubkey) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.author(pubkey, Kind.MuteSets) }),
      queryClient.invalidateQueries({ queryKey: ['feed'] }),
    ])
  }

  const getNow = () => Math.floor(Date.now() / 1000)
  const nextCreatedAt = (event?: NostrEventDB) => {
    const now = getNow()
    if (!event) {
      return now
    }
    return Math.max(now, event.created_at + 1)
  }

  const toggleTargetValue = (values: string[], value: string) => {
    if (values.includes(value)) {
      return values.filter((item) => item !== value)
    }
    return [...values, value]
  }

  const submitAndRefresh = async (event: UnsignedEvent) => {
    await mutateAsync(event)
    onClose()
    void invalidateMuteQueries()
  }

  const parseDecryptedTags = (content: string): string[][] | undefined => {
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        return parsed as string[][]
      }
      return undefined
    } catch {
      return undefined
    }
  }

  const onSubmit = async (target?: NostrEventDB, decryptedTags?: string[][]) => {
    if (!pubkey || !signer || !targetValue) {
      return
    }

    const targetEvent = target || muteList
    const isPrivate = !!targetEvent?.content

    if (!targetEvent) {
      await submitAndRefresh({
        kind: Kind.Mutelist,
        pubkey,
        tags: [[targetTagName, targetValue]],
        content: '',
        created_at: getNow(),
      })
      return
    }

    const publicTags = targetEvent.tags.filter((tag) => tag[0] !== targetTagName)

    if (isPrivate) {
      const privateTags =
        decryptedTags ||
        (targetEvent.content
          ? parseDecryptedTags(await signer.decrypt(pubkey, targetEvent.content))
          : undefined)
      if (!privateTags) {
        enqueueToast({ component: 'Cannot decrypt private mute set', duration: 4000 })
        return
      }
      const currentValues = privateTags.filter((tag) => tag[0] === targetTagName).map((tag) => tag[1])
      const nextValues = toggleTargetValue(currentValues, targetValue)
      const otherPrivateTags = privateTags.filter((tag) => tag[0] !== targetTagName)
      const nextPrivateTags = [...otherPrivateTags, ...nextValues.map((value) => [targetTagName, value])]
      const encrypted = await signer.encrypt(pubkey, JSON.stringify(nextPrivateTags))
      await submitAndRefresh({
        kind: targetEvent.kind,
        pubkey,
        tags: publicTags,
        content: encrypted,
        created_at: nextCreatedAt(targetEvent),
      })
      return
    }

    const currentValues = targetEvent.tags.filter((tag) => tag[0] === targetTagName).map((tag) => tag[1])
    const nextValues = toggleTargetValue(currentValues, targetValue)
    const nextTags = [...publicTags, ...nextValues.map((value) => [targetTagName, value])]
    await submitAndRefresh({
      kind: targetEvent.kind,
      pubkey,
      tags: nextTags,
      content: '',
      created_at: nextCreatedAt(targetEvent),
    })
  }

  const createMuteSet = async (isPrivate: boolean) => {
    if (!pubkey || !signer || !targetValue) {
      return
    }
    const dTag = `mute-${crypto.randomUUID()}`
    const title = isPrivate ? 'Private Mute List' : 'Custom Mute List'
    const content = isPrivate ? await signer.encrypt(pubkey, JSON.stringify([[targetTagName, targetValue]])) : ''
    await mutateAsync({
      kind: Kind.MuteSets,
      pubkey,
      tags: [
        ['d', dTag],
        ['title', title],
        ...(!isPrivate ? [[targetTagName, targetValue]] : []),
      ],
      content,
      created_at: Math.floor(Date.now() / 1000),
    })
    await invalidateMuteQueries()
  }

  return (
    <DialogSheet open={open} onClose={onClose} maxWidth='sm'>
      <Stack horizontal={false} gap={0}>
        <Stack sx={styles.header} align='center' justify='space-between'>
          <IconButton size='md' onClick={onClose} icon={<IconX size={22} />} />
          <Text variant='title' size='lg'>
            Mute {targetLabel}
          </Text>
          <span style={{ width: 36 }} />
        </Stack>
        <Stack horizontal={false} gap={2} sx={styles.content}>
          <Stack horizontal={false} gap={1}>
            <Text variant='label' size='md' sx={styles.sectionTitle}>
              Main Mute List
            </Text>
            <MuteOptionItem
              label='Public Mutes'
              event={muteList}
              targetTagName={targetTagName}
              targetValue={targetValue}
              onSubmit={(event, decryptedTags) => {
                void onSubmit(event, decryptedTags)
              }}
            />
          </Stack>
          <Stack horizontal={false} gap={1}>
            <Text variant='label' size='md' sx={styles.sectionTitle}>
              Mute Sets
            </Text>
            {muteSetsList.map((set) => {
              return (
                <MuteOptionItem
                  key={set.id}
                  event={set}
                  targetTagName={targetTagName}
                  targetValue={targetValue}
                  onSubmit={(event, decryptedTags) => {
                    void onSubmit(event, decryptedTags)
                  }}
                />
              )
            })}
            {muteSetsList.length === 0 ? (
              <Stack horizontal={false} gap={1} align='flex-start'>
                <Text variant='body' size='md' sx={styles.empty}>
                  No mute sets yet.
                </Text>
                <ListItem
                  interactive
                  sx={styles.item}
                  onClick={() => {
                    void createMuteSet(false)
                  }}>
                  Create custom muted list
                </ListItem>
                <ListItem
                  interactive
                  sx={styles.item}
                  trailing={
                    <span style={{ color: palette.warning }}>
                      <IconLock size={22} strokeWidth='1.5' />
                    </span>
                  }
                  onClick={() => {
                    void createMuteSet(true)
                  }}>
                  Create private mute list
                </ListItem>
              </Stack>
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
  itemError: {
    borderColor: palette.error,
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
