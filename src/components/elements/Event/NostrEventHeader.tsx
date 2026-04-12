import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { PostHeader } from '../Posts/PostHeader'
import { RepostHeader } from '../Repost/RepostHeader'
import { PublicMessageHeader } from '../PublicMessage/PublicMessageHeader'

type Props = {
  event: NostrEventDB
  children?: React.ReactNode
}

export const NostrEventHeader = (props: Props) => {
  const { event, children } = props
  switch (event.kind) {
    case Kind.Repost: {
      return <RepostHeader event={event}>{children}</RepostHeader>
    }
    case Kind.PublicMessage: {
      return <PublicMessageHeader event={event}>{children}</PublicMessageHeader>
    }
    default: {
      return <PostHeader event={event}>{children}</PostHeader>
    }
  }
}
