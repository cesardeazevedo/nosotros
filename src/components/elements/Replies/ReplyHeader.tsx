import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useParentEvent } from '@/hooks/query/useQueryBase'
import { useUserMetadata } from '@/hooks/state/useUser'
import { useNevent } from '@/hooks/useEventUtils'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconDotsVertical } from '@tabler/icons-react'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'

export const ReplyHeader = memo(function ReplyHeader() {
  const { dense } = useContentContext()
  const { event } = useNoteContext()
  const parent = useParentEvent(event)
  const parentUser = useUserMetadata(parent.data?.pubkey)
  const nevent = useNevent(parent.data)
  return (
    <Stack sx={[styles.root, dense && styles.root$dense]} gap={2}>
      <IconDotsVertical size={20} {...css.props(styles.icon)} />
      <LinkNEvent nevent={nevent}>
        <Button variant='filledTonal' sx={styles.button}>
          Replying to {parentUser.displayName}
        </Button>
      </LinkNEvent>
    </Stack>
  )
})

const styles = css.create({
  root: {
    marginLeft: spacing.margin1,
    paddingInline: spacing.padding2,
    paddingBottom: spacing.padding1,
  },
  root$dense: {
    paddingInline: 0,
  },
  vertical: {
    position: 'relative',
    width: 2,
    height: 20,
    backgroundColor: palette.outlineVariant,
  },
  icon: {
    color: palette.outline,
  },
  button: {
    maxWidth: 300,
  },
})
