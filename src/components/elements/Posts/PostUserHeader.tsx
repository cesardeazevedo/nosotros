import type { Note } from '@/stores/notes/note'
import { UserHeader, type Props as UserHeaderProps } from '../User/UserHeader'
import { PostHeaderDate } from './PostHeaderDate'
import { PostPow } from './PostPow'

type Props = Omit<UserHeaderProps, 'pubkey'> & {
  note: Note
}

export const PostUserHeader = (props: Props) => {
  const { note, ...rest } = props
  return (
    <UserHeader pubkey={note.event.pubkey} {...rest}>
      <PostPow note={note} />
      <PostHeaderDate note={note} />
    </UserHeader>
  )
}
