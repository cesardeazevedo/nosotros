import { useNoteContext } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useRepliesPubkeys } from '@/hooks/query/useReplies'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'
import { UsersAvatars } from '../User/UsersAvatars'

export const ThreadRepliesSummary = memo(function ThreadRepliesSummary() {
  const { note } = useNoteContext()
  const pubkeys = useRepliesPubkeys(note)
  const total = note.repliesTotal || ''

  return (
    <LinkNEvent nevent={note.nip19}>
      <Stack sx={styles.root} gap={1}>
        <Stack sx={styles.avatars} justify='center'>
          <UsersAvatars renderTooltip={false} pubkeys={pubkeys.slice(0, 3)} />
        </Stack>
        <Button variant='text'>
          {note.metadata?.isRoot && `See full thread`}
          {!note.metadata?.isRoot && `${total} replies`}
        </Button>
      </Stack>
    </LinkNEvent>
  )
})

const styles = css.create({
  root: {
    paddingInline: spacing.padding1,
  },
  avatars: {
    width: 55,
  },
})
