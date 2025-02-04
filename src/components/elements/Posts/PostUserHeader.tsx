import { useNoteContext } from '@/components/providers/NoteProvider'
import { UserHeader, type Props as UserHeaderProps } from '../User/UserHeader'
import { PostHeaderDate } from './PostHeaderDate'
import { PostPow } from './PostPow'

type Props = Omit<UserHeaderProps, 'pubkey'> & {}

export const PostUserHeader = function PostUserHeader(props: Props) {
  const { ...rest } = props
  const { note } = useNoteContext()
  return (
    <UserHeader pubkey={note.event.pubkey} {...rest}>
      <PostPow />
      <PostHeaderDate nevent={note.event.nevent} date={note.event.event.created_at} />
    </UserHeader>
  )
}
