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
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconLock, IconLockOpen, IconPencil } from '@tabler/icons-react'
import { useNevent } from '@/hooks/useEventUtils'
import { LinkNEvent } from '@/components/elements/Links/LinkNEvent'
import { useEffect, useState } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  event: NostrEventDB
  onEdit: (event: NostrEventDB) => void
  isLast: boolean
  canEdit: boolean
  decryptAllSignal?: number
}

export const ListRow = (props: Props) => {
  const { event, onEdit, isLast, canEdit, decryptAllSignal } = props
  const nevent = useNevent(event)
  const [decryptRequested, setDecryptRequested] = useState(false)
  const decryptedTags = useEventDecryptedTags(decryptRequested ? event : undefined)
  const title = event.tags.find((tag) => tag[0] === 'title')?.[1]
  const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1]
  const label = title || dTag || '-'
  const displayKind = KIND_LABELS[event.kind]
    ? `${KIND_LABELS[event.kind]} (${event.kind})`
    : `Kind ${event.kind}`
  const listTags = event.tags.filter((tag) => !['title', 'description', 'd'].includes(tag[0]))
  const pubkeys = listTags.filter((tag) => tag[0] === 'p').map((tag) => tag[1])
  const hasEncrypted = !!event.content
  const tagsCount = hasEncrypted ? (decryptedTags?.filter((tag) => tag[0] !== 'title' && tag[0] !== 'description' && tag[0] !== 'd').length || 0) : listTags.length

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
    <LinkNEvent nevent={nevent} sx={styles.rowLink}>
      <html.div style={[styles.row, isLast && styles.rowLast]}>
        <html.div style={[styles.cell, styles.cellFirst]}>
          <Stack gap={1} align='center'>
            <UserAvatar size='xs' pubkey={event.pubkey} />
            <UserName pubkey={event.pubkey} />
          </Stack>
        </html.div>
        <html.div style={styles.cell}>
          <Text variant='body' size='md'>
            {displayKind}
          </Text>
          {hasEncrypted && <IconLock size={14} strokeWidth='2.5' />}
        </html.div>
        <html.div style={styles.cell}>
          <Text variant='body' size='md'>
            {label}
          </Text>
        </html.div>
        <html.div style={styles.cell}>
          {hasEncrypted && !decryptRequested ? (
            <Button variant='outlined' onClick={handleDecrypt} sx={styles.decryptButton}>
              <IconLockOpen size={14} />
              Decrypt
            </Button>
          ) : (
            <Text variant='body' size='md'>
              {tagsCount}
            </Text>
          )}
        </html.div>
        <html.div style={[styles.cell, styles.cellLast]}>
          {pubkeys.length > 0 ? <UsersAvatars pubkeys={pubkeys} max={4} /> : null}
        </html.div>
        <html.div style={styles.cell}>
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
        </html.div>
      </html.div>
    </LinkNEvent>
  )
}

const styles = css.create({
  row: {
    display: 'grid',
    gridTemplateColumns: '220px 180px 1fr 120px 180px 40px',
    gap: spacing.padding1,
    paddingBlock: spacing.padding1,
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
  },
  rowLast: {
    borderBottom: 'none',
  },
  rowLink: {
    display: 'block',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.06)',
    },
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
  decryptButton: {
    height: 24,
    borderColor: palette.warning,
    paddingInlineStart: spacing.padding1,
    paddingInlineEnd: spacing.padding1,
  },
})
