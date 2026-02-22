import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { Button } from '@/components/ui/Button/Button'
import { Checkbox } from '@/components/ui/Checkbox/Checkbox'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { KIND_LABELS, Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { queryKeys } from '@/hooks/query/queryKeys'
import { replaceableEventQueryOptions } from '@/hooks/query/useQueryBase'
import { useCurrentPubkey, useCurrentSigner } from '@/hooks/useAuth'
import { useEventDecrypt } from '@/hooks/useEventDecrypt'
import { publish } from '@/nostr/publish/publish'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconLock, IconX } from '@tabler/icons-react'
import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import type { UnsignedEvent } from 'nostr-tools'
import { useActionState, useEffect, useMemo, useState } from 'react'
import { css } from 'react-strict-dom'
import { ListTagBox } from './ListTagBox'

type Props = (
  | { isEditing: true; event: NostrEventDB }
  | { isEditing: false; kind?: number }
) & {
  onClose?: () => void
}

const KIND_OPTIONS = Object.entries(KIND_LABELS)
  .map(([kind, label]) => ({ kind: Number(kind), label }))
  .sort((a, b) => a.kind - b.kind)
const LIST_KIND_OPTIONS_ONLY = KIND_OPTIONS.filter((option) => option.kind < 30000)
const SET_KIND_OPTIONS = KIND_OPTIONS.filter((option) => option.kind >= 30000)

export const ListForm = (props: Props) => {
  const { isEditing, onClose } = props
  const editingEvent = isEditing ? (props as { event: NostrEventDB }).event : undefined
  const initialKind = isEditing ? (props as { event: NostrEventDB }).event.kind : props.kind
  const [kind, setKind] = useState<number | null>(initialKind ?? null)
  const [kindInput, setKindInput] = useState('')
  const [kindEditing, setKindEditing] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [kindOpen, setKindOpen] = useState(false)
  const pubkey = useCurrentPubkey()
  const signer = useCurrentSigner()
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const queryClient = useQueryClient()

  const shouldCheckReplaceable = !isEditing && kind !== null && kind < 30000 && !!pubkey
  const replaceableQuery = useQuery(
    replaceableEventQueryOptions((kind ?? Kind.Follows) as Kind, pubkey || '', {
      enabled: shouldCheckReplaceable,
    }),
  )
  const resolvedEditingEvent = isEditing
    ? editingEvent
    : shouldCheckReplaceable && replaceableQuery.data?.kind === kind
      ? replaceableQuery.data
      : null
  const isEditingEffective = !!resolvedEditingEvent
  const hasEncrypted = !!resolvedEditingEvent?.content
  const tagBoxKey = useMemo(() => `${kind ?? 'none'}-${resolvedEditingEvent?.id ?? 'new'}`, [resolvedEditingEvent?.id, kind])
  const [, decryptedContent] = useEventDecrypt(hasEncrypted ? resolvedEditingEvent || undefined : undefined)
  const decryptedTags = useMemo(() => {
    if (!decryptedContent) return null
    try {
      const parsed = JSON.parse(decryptedContent)
      return Array.isArray(parsed) ? (parsed as string[][]) : null
    } catch {
      return null
    }
  }, [decryptedContent])

  const kindLabel = useMemo(() => {
    if (kind === null) return 'Select a kind'
    const found = KIND_OPTIONS.find((x) => x.kind === kind)
    return found?.label || `Custom (${kind})`
  }, [kind])

  const kindDisplayValue = useMemo(() => {
    if (kind === null) return ''
    const found = KIND_OPTIONS.find((x) => x.kind === kind)
    return found ? `${found.label} (${kind})` : `Custom (${kind})`
  }, [kind])

  useEffect(() => {
    if (kindEditing) return
    if (kind === null) {
      setKindInput('')
      return
    }
    setKindInput(kindDisplayValue)
  }, [kind, kindDisplayValue, kindEditing])

  useEffect(() => {
    if (hasEncrypted) {
      setIsPrivate(true)
    }
  }, [hasEncrypted])

  const { isPending, mutateAsync } = usePublishEventMutation<UnsignedEvent>({
    mutationFn:
      ({ signer }) =>
        (newEvent) => {
          return publish(newEvent, { signer })
        },
  })

  const normalizeTagValue = (tag: string, value: string) => {
    const trimmed = value.trim()
    if (tag === 't') {
      return trimmed.replace(/^#/, '')
    }
    return trimmed
  }

  const [error, submit] = useActionState(async (_: unknown, formData: FormData) => {
    try {
      const title = String(formData.get('title') || '').trim()
      const description = String(formData.get('description') || '').trim()
      const tagRows: Record<string, { type?: string; value?: string; relay?: string }> = {}

      for (const [key, value] of formData.entries()) {
        if (typeof value !== 'string') continue
        const match = key.match(/^tags\[(.+)\]\[(type|value|relay)\]$/)
        if (!match) continue
        const [, rowId, field] = match
        tagRows[rowId] ||= {}
        tagRows[rowId][field as 'type' | 'value' | 'relay'] = value
      }

      const tags = Object.values(tagRows)
        .map((row) => {
          const tagName = row.type?.trim() || ''
          const normalized = normalizeTagValue(tagName, row.value || '')
          const relay = row.relay?.trim() || ''
          if (!tagName || !normalized) return null
          return relay ? [tagName, normalized, relay] : [tagName, normalized]
        })
        .filter(Boolean) as string[][]

      if (!title) return 'title required' as string
      if (kind === null) return 'kind required' as string
      if (!signer || !pubkey) return 'signin required' as string

      const existingD = isEditingEffective ? resolvedEditingEvent?.tags.find((x) => x[0] === 'd')?.[1] : undefined
      const isListSet = kind >= 30000
      const uuid = window.crypto.randomUUID().replace(/-/g, '').slice(0, 21)
      const dTag = isListSet ? existingD || uuid : undefined

      let privateContent = ''
      if (isPrivate) {
        privateContent = await signer.encrypt(pubkey, JSON.stringify(tags))
      }

      const publicTags = [
        ['title', title],
        ...(description ? [['description', description]] : []),
        ...(dTag ? [['d', dTag]] : []),
      ]

      const newEvent = {
        kind,
        content: privateContent,
        pubkey,
        tags: isPrivate ? publicTags : [...publicTags, ...tags],
      } as UnsignedEvent

      await mutateAsync(newEvent)

      onClose?.()
      const predicate = (query: { queryKey: QueryKey }) => {
        return query.queryKey[0] === 'feed' && typeof query.queryKey[1] === 'string' && query.queryKey[1].startsWith('list')
      }
      queryClient.resetQueries({ predicate })
      queryClient.invalidateQueries({ predicate })
      queryClient.invalidateQueries({ queryKey: queryKeys.author(pubkey || '', kind) })
    } catch (error) {
      const msg = error as Error
      enqueueToast({ component: msg.toString(), duration: 4000 })
    }
  }, null)

  return (
    <form action={submit}>
      <Stack sx={styles.root} horizontal={false}>
        <Stack sx={styles.header} justify='space-between' align='center'>
          <IconButton
            size='md'
            onClick={onClose}
            sx={styles.closeButton}
            icon={<IconX size={24} />}
            aria-label='Close'
          />
          <Text variant='title' size='lg'>
            {`${isEditingEffective ? 'Edit' : 'Create new'} List`}
          </Text>
          <Button disabled={isPending} type='submit' variant='filled' sx={styles.headerButton}>
            {isEditingEffective ? 'Update' : 'Create'}
          </Button>
        </Stack>
        <Divider />
        <Stack sx={styles.content} horizontal={false} gap={2}>
          <Text variant='title' size='md' sx={styles.subtitle}>
            {kindLabel}
          </Text>
          <PopoverBase
            opened={kindOpen}
            onClose={() => setKindOpen(false)}
            placement='bottom-start'
            openEvents={{ click: true }}
            contentRenderer={() => (
              <Paper elevation={3} surface='surfaceContainerLow' sx={styles.menuPaper}>
                <Stack gap={1} horizontal={false} sx={styles.menuScroll}>
                  <Text variant='label' size='md' sx={styles.menuSubheader}>
                    LISTS
                  </Text>
                  {LIST_KIND_OPTIONS_ONLY.map((option) => (
                    <ListItem
                      key={option.kind}
                      interactive
                      size='sm'
                      selected={option.kind === kind}
                      onClick={() => {
                        setKind(option.kind)
                        setKindOpen(false)
                        setKindInput(`${option.label} (${option.kind})`)
                      }}>
                      {`${option.label} (${option.kind})`}
                    </ListItem>
                  ))}
                  <Text variant='label' size='md' sx={styles.menuSubheader}>
                    SETS
                  </Text>
                  {SET_KIND_OPTIONS.map((option) => (
                    <ListItem
                      key={option.kind}
                      interactive
                      size='sm'
                      selected={option.kind === kind}
                      onClick={() => {
                        setKind(option.kind)
                        setKindOpen(false)
                        setKindInput(`${option.label} (${option.kind})`)
                      }}>
                      {`${option.label} (${option.kind})`}
                    </ListItem>
                  ))}
                </Stack>
              </Paper>
            )}>
            {({ setRef, getProps }) => (
              <span
                ref={setRef}
                {...getProps()}
                style={{ width: 'fit-content' }}
                onClick={() => {
                  setKindOpen(true)
                }}>
                <TextField
                  label='Kind'
                  value={kindInput}
                  shrink
                  placeholder='Select kind'
                  trailing={<IconChevronDown size={16} />}
                  sx={styles.kindField}
                  onFocus={() => {
                    setKindEditing(true)
                    setKindInput(kind !== null ? String(kind) : '')
                  }}
                  onBlur={() => {
                    setKindEditing(false)
                    if (kind !== null) {
                      setKindInput(kindDisplayValue)
                    } else {
                      setKindInput('')
                    }
                  }}
                  onChange={(event) => {
                    const nextValue = event.currentTarget.value
                    setKindInput(nextValue)
                    const parsed = Number(nextValue)
                    if (nextValue.trim() === '') {
                      setKind(null)
                      setKindOpen(false)
                      return
                    }
                    if (!Number.isNaN(parsed)) {
                      setKind(parsed)
                    } else {
                      setKind(null)
                    }
                    setKindOpen(false)
                  }}
                />
              </span>
            )}
          </PopoverBase>
          <TextField
            label='Name'
            error={!!error}
            fullWidth
            shrink
            placeholder='List name'
            name='title'
            defaultValue={resolvedEditingEvent?.tags.find((tag) => tag[0] === 'title')?.[1] || ''}
          />
          <TextField
            label='Description'
            fullWidth
            multiline
            rows={3}
            shrink
            placeholder='Optional description'
            name='description'
            defaultValue={resolvedEditingEvent?.tags.find((tag) => tag[0] === 'description')?.[1] || ''}
          />
          <Stack gap={0.5} align='center'>
            <Text variant='title' size='md' sx={styles.subtitle}>
              Tags
            </Text>
            {hasEncrypted && <IconLock size={14} strokeWidth='2.5' />}
          </Stack>
          {replaceableQuery.isFetching && shouldCheckReplaceable ? (
            <Text variant='body' size='md'>
              Loading list…
            </Text>
          ) : (
            <ListTagBox
              key={tagBoxKey}
              event={resolvedEditingEvent ?? undefined}
              initialTags={decryptedTags ?? undefined}
            />
          )}
          <MenuItem
            label='Private List'
            sx={styles.privateItem}
            trailing={
              <Checkbox checked={isPrivate} onChange={() => setIsPrivate((prev) => !prev)} />
            }
          />
        </Stack>
      </Stack>
    </form>
  )
}

const styles = css.create({
  root: {},
  header: {
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding2,
  },
  content: {
    padding: spacing.padding2,
    paddingBottom: spacing.padding1,
  },
  headerButton: {
    height: 40,
  },
  closeButton: {
    marginRight: spacing.padding1,
  },
  list: {
    padding: spacing.padding2,
  },
  subtitle: {
    color: 'inherit',
  },
  menuPaper: {
    width: 320,
    overflow: 'visible',
  },
  menuScroll: {
    maxHeight: 400,
    overflowY: 'auto',
    padding: spacing.padding1,
  },
  menuSubheader: {
    color: 'gray',
    paddingInline: spacing.padding1,
    letterSpacing: '0.08em',
    marginTop: spacing.margin1,
  },
  privateItem: {
    width: 'fit-content',
    alignSelf: 'flex-start',
  },
  kindField: {
    width: 320,
  },
})
