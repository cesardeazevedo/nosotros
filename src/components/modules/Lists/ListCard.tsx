import { LinkNEvent } from '@/components/elements/Links/LinkNEvent'
import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { UserName } from '@/components/elements/User/UserName'
import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { KIND_LABELS } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventDecryptedTags } from '@/hooks/useEventDecrypt'
import { useNevent } from '@/hooks/useEventUtils'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconLock, IconLockOpen, IconPencil } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  event: NostrEventDB
  onEdit: (event: NostrEventDB) => void
  canEdit: boolean
  decryptAllSignal?: number
}

export const ListCard = (props: Props) => {
  const { event, onEdit, canEdit, decryptAllSignal } = props
  const nevent = useNevent(event)
  const [decryptRequested, setDecryptRequested] = useState(false)
  const decryptedTags = useEventDecryptedTags(decryptRequested ? event : undefined)
  const title = event.tags.find((tag) => tag[0] === 'title')?.[1]
  const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1]
  const label = title || dTag || '-'
  const displayKind = KIND_LABELS[event.kind]
    ? `${KIND_LABELS[event.kind]} (${event.kind})`
    : `Kind ${event.kind}`
  const image = event.tags.find((tag) => tag[0] === 'image')?.[1]
  const listTags = event.tags.filter((tag) => !['title', 'description', 'd'].includes(tag[0]))
  const pubkeys = listTags.filter((tag) => tag[0] === 'p').map((tag) => tag[1])
  const description = event.tags.find((tag) => tag[0] === 'description')?.[1]
  const hasEncrypted = !!event.content
  const tagsCount = hasEncrypted
    ? (decryptedTags?.filter((tag) => tag[0] !== 'title' && tag[0] !== 'description' && tag[0] !== 'd').length || 0)
    : listTags.length

  useEffect(() => {
    if (!hasEncrypted) {
      return
    }
    if (decryptAllSignal) {
      setDecryptRequested(true)
    }
  }, [decryptAllSignal, hasEncrypted])

  const handleDecrypt = (eventClick: { preventDefault: () => void; stopPropagation: () => void }) => {
    eventClick.preventDefault()
    eventClick.stopPropagation()
    setDecryptRequested(true)
  }

  return (
    <LinkNEvent nevent={nevent} sx={styles.cardLink}>
      <Stack horizontal={false} sx={styles.card}>
        {image && (
          <html.div style={styles.cardMedia}>
            <html.img src={image} alt={label} style={styles.cardMediaImg} />
          </html.div>
        )}
        <Stack justify='space-between' align='center' sx={styles.cardMeta}>
          <Stack gap={1} align='center'>
            <UserAvatar size='xs' pubkey={event.pubkey} />
            <UserName pubkey={event.pubkey} />
          </Stack>
          {canEdit && (
            <IconButton
              size='sm'
              onClick={(eventClick) => {
                eventClick.preventDefault()
                eventClick.stopPropagation()
                onEdit(event)
              }}
              icon={<IconPencil size={16} />}
            />
          )}
        </Stack>
        <Stack horizontal={false} gap={0.5} sx={styles.cardContent}>
          <Stack gap={0.5} align='center'>
            <Text variant='label' size='lg' sx={styles.cardKind}>
              {displayKind}
            </Text>
            {hasEncrypted && <IconLock size={14} strokeWidth='2.5' />}
          </Stack>
          <Text variant='title' size='md'>
            {label}
          </Text>
          {description && (
            <Text variant='body' size='sm' sx={styles.cardDescription}>
              {description}
            </Text>
          )}
          <Stack justify='space-between' align='center' sx={styles.cardFooter}>
            {hasEncrypted && !decryptRequested ? (
              <Button variant='outlined' onClick={handleDecrypt} sx={styles.decryptButton}>
                <IconLockOpen size={14} />
                Decrypt
              </Button>
            ) : (
              <Text variant='body' size='sm'>
                {tagsCount} tags
              </Text>
            )}
            {pubkeys.length > 0 ? <UsersAvatars pubkeys={pubkeys} max={4} /> : null}
          </Stack>
        </Stack>
      </Stack>
    </LinkNEvent>
  )
}

const styles = css.create({
  card: {
    height: '100%',
    borderRadius: shape.lg,
    border: '1px solid',
    borderColor: palette.outlineVariant,
    padding: spacing.padding1,
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.08)',
    },
  },
  cardMedia: {
    height: 140,
    borderRadius: shape.md,
    overflow: 'hidden',
    backgroundColor: palette.surfaceContainerHighest,
  },
  cardMediaImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  cardMeta: {
    padding: spacing.padding1,
    marginTop: spacing.margin1,
  },
  cardContent: {
    padding: spacing.padding1,
    flexGrow: 1,
  },
  cardFooter: {
    marginTop: 'auto',
  },
  cardKind: {
    color: palette.onSurfaceVariant,
  },
  cardDescription: {
    color: palette.onSurfaceVariant,
  },
  decryptButton: {
    minWidth: 94,
    height: 30,
    paddingInlineStart: spacing.padding2,
    paddingInlineEnd: spacing.padding2,
  },
  cardLink: {
    display: 'block',
    height: '100%',
  },
})
