import { FollowEventRoot } from '@/components/modules/Follows/FollowEventRoot'
import { ListEventRoot } from '@/components/modules/Lists/ListEventRoot'
import { Kind, isListKind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { memo } from 'react'
import { PostRoot } from '../Posts/Post'
import { PublicMessageRoot } from '../PublicMessage/PublicMessageRoot'
import { RepostRoot } from '../Repost/Repost'
import { ThreadRelated } from '../Threads/ThreadRelated'
import { Threads } from '../Threads/Threads'
import { UserRoot } from '../User/UserRoot'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupportedContent } from './NostrEventUnsupportedContent'

type Props = {
  event: NostrEventDB
  open?: boolean
}

export const NostrEventRoot = memo(function NostrEventRoot(props: Props) {
  const { event, open } = props
  switch (event.kind) {
    case Kind.Metadata: {
      return <UserRoot pubkey={event.pubkey} />
    }
    case Kind.Comment:
    case Kind.Highlight:
    case Kind.Text: {
      return event.metadata?.isRoot ? (
        <PostRoot event={event} open={open} />
      ) : (
        <>
          <Threads event={event} renderReplies renderRepliesSummary={false} />
          <ThreadRelated event={event} />
        </>
      )
    }
    case Kind.Follows: {
      return <FollowEventRoot event={event} />
    }
    case Kind.PublicMessage:
      return <PublicMessageRoot event={event} />
    case Kind.Article: {
      return <PostRoot event={event} open={open} />
    }
    case Kind.Repost: {
      return <RepostRoot event={event} />
    }
    case Kind.Media:
    case Kind.Video:
    case Kind.ShortVideo: {
      return <PostRoot open={open} event={event} />
    }
    case Kind.ZapReceipt: {
      return <ZapReceiptRoot event={event} />
    }
    default: {
      if (isListKind(event.kind)) {
        return <ListEventRoot event={event} />
      }
      console.log('Unhandled item to render', event)
      return <NostrEventUnsupportedContent event={event} />
    }
  }
})
