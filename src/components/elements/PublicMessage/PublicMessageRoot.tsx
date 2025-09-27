import { NoteProvider } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNoteState } from '@/hooks/state/useNote'
import { useEventTag } from '@/hooks/useEventUtils'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronRight } from '@tabler/icons-react'
import { css } from 'react-strict-dom'
import { PostActions } from '../Posts/PostActions/PostActions'
import { PostContent } from '../Posts/PostContent'
import { PostUserHeader } from '../Posts/PostUserHeader'
import { Replies } from '../Replies/Replies'
import { UserHeader } from '../User/UserHeader'

type Props = {
  event: NostrEventDB
}

export const PublicMessageRoot = (props: Props) => {
  const { event } = props
  const to = useEventTag(event, 'p')
  const note = useNoteState(event, { repliesOpen: true, forceSync: true })
  return (
    <NoteProvider value={{ event }}>
      <Stack sx={styles.header} align='center' gap={1}>
        <PostUserHeader event={event} />
        <IconChevronRight size={16} strokeWidth='3' />
        {to && <UserHeader pubkey={to} />}
      </Stack>
      <PostContent note={note} />
      <PostActions renderReply={false} note={note} />
      {note.state.repliesOpen && (
        <>
          <Divider />
          <Replies note={note} />
        </>
      )}
    </NoteProvider>
  )
}

const styles = css.create({
  header: {
    padding: spacing.padding2,
  },
})
