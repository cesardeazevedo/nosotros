import { useNoteContext } from '@/components/providers/NoteProvider'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { UserHeader, type Props as UserHeaderProps } from '../User/UserHeader'
import { PostHeaderDate } from './PostHeaderDate'
import { PostPow } from './PostPow'

type Props = Omit<UserHeaderProps, 'pubkey'> & {
  event: NostrEventDB
}

export const PostUserHeader = function PostUserHeader(props: Props) {
  const { event, ...rest } = props
  const { note } = useNoteContext()
  return (
    <UserHeader pubkey={note.event.pubkey} {...rest}>
      <PostPow />
      <PostHeaderDate nevent={note.nip19} date={event.created_at} />
    </UserHeader>
  )
}
