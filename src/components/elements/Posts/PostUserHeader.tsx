import { useNostrContext } from '@/components/providers/NostrContextProvider'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNevent } from '@/hooks/useEventUtils'
import { UserHeader, type Props as UserHeaderProps } from '../User/UserHeader'
import { PostHeaderDate } from './PostHeaderDate'
import { PostPow } from './PostPow'
import { PostTag } from './PostTag'

type Props = Omit<UserHeaderProps, 'pubkey'> & {
  event: NostrEventDB
}

export const PostUserHeader = function PostUserHeader(props: Props) {
  const { event, ...rest } = props
  const nevent = useNevent(event)
  const isFeed = !!useNostrContext()
  return (
    <UserHeader pubkey={event.pubkey} {...rest}>
      <PostPow event={event} />
      <PostHeaderDate nevent={nevent} date={event.created_at} />
      {isFeed && event.kind !== Kind.Follows && <PostTag event={event} />}
    </UserHeader>
  )
}
