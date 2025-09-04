import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NoteState } from '@/hooks/state/useNote'
import { spacing } from '@/themes/spacing.stylex'
import { memo, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'
import { UsersAvatars } from '../User/UsersAvatars'

type Props = {
  note: NoteState
}

export const ThreadRepliesSummary = memo(function ThreadRepliesSummary(props: Props) {
  const { note } = props
  const pubkeys = useMemo(() => note.replies.data?.map((x) => x.pubkey) || [], [note.replies.data])
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
