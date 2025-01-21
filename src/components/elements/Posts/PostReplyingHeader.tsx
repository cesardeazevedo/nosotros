import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Note } from '@/stores/notes/note'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconDotsVertical } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'
import { useNoteContext } from '@/components/providers/NoteProvider'

type Props = {
  note: Note
}

export const PostReplyingHeader = observer(function PostReplyingHeader(props: Props) {
  const { note } = props
  const { dense, disableLink } = useNoteContext()
  return (
    <Stack sx={[styles.root, dense && styles.root$dense]} gap={1}>
      <IconDotsVertical size={20} {...css.props(styles.icon)} />
      <LinkNEvent nevent={note.parent?.nevent || note.nevent} disableLink={disableLink}>
        <Button sx={styles.button} variant='filledTonal'>
          Replying to {note.parent?.user?.displayName}
        </Button>
      </LinkNEvent>
    </Stack>
  )
})

const styles = css.create({
  root: {
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
  button: {},
})
