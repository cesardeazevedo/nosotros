import { NoteProvider } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNoteState } from '@/hooks/state/useNote'
import { PostActions } from '../Posts/PostActions/PostActions'
import { PostContent } from '../Posts/PostContent'
import { PostHeader } from '../Posts/PostHeader'
import { Replies } from '../Replies/Replies'

type Props = {
  event: NostrEventDB
}

export const PublicMessageRoot = (props: Props) => {
  const { event } = props
  const note = useNoteState(event, { repliesOpen: true, forceSync: true })
  return (
    <NoteProvider value={{ event }}>
      <PostHeader event={event} />
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
