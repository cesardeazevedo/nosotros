import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { observer } from 'mobx-react-lite'
import { PostHeaderDate } from '../Posts/PostHeaderDate'
import { UserName } from '../User/UserName'
import { UserNIP05 } from '../User/UserNIP05'

export const ReplyUserHeader = observer(function ReplyUserHeader() {
  const { note } = useNoteContext()
  return (
    <Stack horizontal={false}>
      <Stack gap={1} align='center'>
        <UserName pubkey={note.event.pubkey} />
        <PostHeaderDate nevent={note.event.nevent} date={note.event.event.created_at} />
      </Stack>
      <UserNIP05 pubkey={note.event.pubkey} />
    </Stack>
  )
})
