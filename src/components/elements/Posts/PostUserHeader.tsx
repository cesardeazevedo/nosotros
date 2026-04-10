import { useNostrContext } from '@/components/providers/NostrContextProvider'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { UserHeader, type Props as UserHeaderProps } from '../User/UserHeader'
import { PostHeaderDate } from './PostHeaderDate'
import { PostPow } from './PostPow'
import { PostTag } from './PostTag'
import { Stack } from '@/components/ui/Stack/Stack'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'

type Props = Omit<UserHeaderProps, 'pubkey'> & {
  event: NostrEventDB
}

export const PostUserHeader = function PostUserHeader(props: Props) {
  const { event, children, ...rest } = props
  const isFeed = !!useNostrContext()
  // return (
  //   <Stack align='center' gap={1}>
  //     <UserAvatar pubkey={event.pubkey} size='md' />
  //     <Stack horizontal={false}>
  //       <Stack gap={1} align='center'>
  //         <UserName pubkey={event.pubkey} />
  //         <PostHeaderDate date={event.created_at} />
  //       </Stack>
  //       {children}
  //     </Stack>
  //   </Stack>
  // )
  return (
    <UserHeader pubkey={event.pubkey} {...rest}>
      <PostPow event={event} />
      <PostHeaderDate event={event} date={event.created_at} />
      {isFeed && event.kind !== Kind.Follows && <PostTag event={event} />}
    </UserHeader>
  )
}
