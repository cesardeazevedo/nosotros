import { ArticleFeedItem } from '@/components/modules/Articles/ArticleFeedItem'
import { FollowEventRoot } from '@/components/modules/Follows/FollowEventRoot'
import { FollowSetItem } from '@/components/modules/Lists/FollowSets/FollowSetItem'
import { Divider } from '@/components/ui/Divider/Divider'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { memo } from 'react'
import { PostRoot } from '../Posts/Post'
import { RepostRoot } from '../Repost/Repost'
import { Threads } from '../Threads/Threads'
import { UserRoot } from '../User/UserRoot'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupportedContent } from './NostrEventUnsupportedContent'

type Props = {
  event: NostrEventDB
}

export const NostrEventFeedItem = memo(function NostrEventFeedItem(props: Props) {
  const { event } = props

  switch (event.kind) {
    case Kind.Metadata: {
      return <UserRoot border pubkey={event.pubkey} />
    }
    case Kind.Text: {
      return event.metadata?.isRoot ? (
        <PostRoot event={event} />
      ) : (
        <>
          <Threads event={event} maxLevel={2} />
          <Divider />
        </>
      )
    }
    case Kind.Follows: {
      return <FollowEventRoot event={event} />
    }
    case Kind.Article: {
      return <ArticleFeedItem border event={event} />
    }
    case Kind.Repost: {
      return <RepostRoot event={event} />
    }
    case Kind.Media:
    case Kind.Video: {
      return <PostRoot event={event} />
    }
    case Kind.ZapReceipt: {
      return <ZapReceiptRoot event={event} />
    }
    case Kind.FollowSets: {
      return <FollowSetItem event={event} />
    }
    default: {
      console.log('Unhandled item to render', event)
      return <NostrEventUnsupportedContent event={event} />
    }
  }
})
