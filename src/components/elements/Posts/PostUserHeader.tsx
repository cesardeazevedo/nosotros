import type { Note } from '@/stores/notes/note'
import { UserHeader, type Props as UserHeaderProps } from '../User/UserHeader'
import { PostHeaderDate } from './PostHeaderDate'
import { PostPow } from './PostPow'

type Props = Omit<UserHeaderProps, 'pubkey'> & {
  note: Note
}

export const PostUserHeader = function PostUserHeader(props: Props) {
  const { note, disableLink, ...rest } = props
  return (
    <UserHeader pubkey={note.event.pubkey} {...rest} disableLink={disableLink}>
      <PostPow note={note} />
      <PostHeaderDate nevent={note.nevent} date={note.event.created_at} disableLink={disableLink} />
    </UserHeader>
  )
}
