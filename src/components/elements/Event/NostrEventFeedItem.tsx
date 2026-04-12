import { isDeletedEventAtomFamily } from '@/atoms/deletion.atoms'
import { PostDeleted } from '@/components/elements/Posts/PostDeleted'
import { ArticleFeedItem } from '@/components/modules/Articles/ArticleFeedItem'
import { FollowEventFeedItem } from '@/components/modules/Follows/FollowEventFeedItem'
import { ListEmojiSetsRoot } from '@/components/modules/Lists/ListEmojiSetsRoot'
import { ListEventRoot } from '@/components/modules/Lists/ListEventRoot'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { EventProvider } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Kind, isListKind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useRepostedEvent } from '@/hooks/query/useQueryBase'
import { getEventId } from '@/utils/nip19'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { PostActions } from '../Posts/PostActions/PostActions'
import { PostContent } from '../Posts/PostContent'
import { PostContentHidden } from '../Posts/PostContentHidden'
import { PostFeedItemContainer } from '../Posts/PostFeedItemContainer'
import { PostLink } from '../Posts/PostLink'
import { RepostRoot } from '../Repost/Repost'
import { Threads } from '../Threads/Threads'
import { UserFeedItem } from '../User/UserFeedItem'
import { ZapReceiptFeedItem } from '../Zaps/ZapReceiptFeedItem'
import { NostrEventHeader } from './NostrEventHeader'
import { NostrEventUnsupportedContent } from './NostrEventUnsupportedContent'
// import { PublicMessageRoot } from '../PublicMessage/PublicMessageRoot'

type Props = {
  event: NostrEventDB
}

export const TextContent = (props: Props) => {
  const { event } = props
  return (
    <PostContentHidden event={event}>
      <PostContent />
    </PostContentHidden>
  )
}

export const NostrEventContent = memo(function NostrEventContent(props: Props) {
  const { event } = props
  switch (event.kind) {
    case Kind.Metadata: {
      return <UserFeedItem pubkey={event.pubkey} />
    }
    case Kind.Follows: {
      return <FollowEventFeedItem event={event} />
    }
    case Kind.Article: {
      return <ArticleFeedItem event={event} />
    }
    case Kind.Repost: {
      return <RepostRoot event={event} />
    }
    case Kind.Text:
    case Kind.Comment:
    case Kind.Highlight:
    case Kind.Media:
    case Kind.Video:
    case Kind.PublicMessage:
    case Kind.ShortVideo: {
      return <TextContent event={event} />
    }
    case Kind.ZapReceipt: {
      return <ZapReceiptFeedItem event={event} />
    }
    case Kind.EmojiSets: {
      return (
        <Paper outlined>
          <ListEmojiSetsRoot event={event} />
        </Paper>
      )
    }
    default: {
      if (isListKind(event.kind)) {
        return (
          <Paper outlined>
            <ListEventRoot event={event} />
          </Paper>
        )
      }
      console.log('Unhandled item to render', event)
      return <NostrEventUnsupportedContent event={event} />
    }
  }
})

const FeedItem = (props: Props) => {
  const { event } = props
  const deleted = useAtomValue(isDeletedEventAtomFamily(getEventId(event)))

  if (deleted) {
    return (
      <>
        <PostDeleted />
        <Divider />
      </>
    )
  }

  if (event.kind === Kind.Text && !event.metadata?.isRoot) {
    return <Threads event={event} maxLevel={2} />
  }

  return (
    <NostrEventHeader event={event}>
      <NostrEventContent event={event} />
      <ContentProvider value={{ dense: true }}>
        <PostActions />
      </ContentProvider>
    </NostrEventHeader>
  )
}

const RepostFeedItemLink = memo(function RepostFeedItemLink(props: Props) {
  const { event } = props
  const { data: innerEvent } = useRepostedEvent(event)

  if (!innerEvent) {
    return <FeedItem event={event} />
  }

  return (
    <EventProvider value={{ event: innerEvent }}>
      <PostLink event={innerEvent}>
        <FeedItem event={event} />
      </PostLink>
    </EventProvider>
  )
})

const NostrEventFeedItemLink = memo(function NostrEventFeedItemLink(props: Props) {
  const { event } = props

  if (event.kind === Kind.Repost) {
    return <RepostFeedItemLink event={event} />
  }

  return (
    <PostLink event={event}>
      <FeedItem event={event} />
    </PostLink>
  )
})

export const NostrEventFeedItem = memo(function NostrEventFeedItem(props: Props) {
  const { event } = props
  return (
    <EventProvider value={{ event }}>
      <ContentProvider value={{ mediaObject: true }}>
        <PostFeedItemContainer event={event}>
          <NostrEventFeedItemLink event={event} />
        </PostFeedItemContainer>
      </ContentProvider>
    </EventProvider>
  )
})
