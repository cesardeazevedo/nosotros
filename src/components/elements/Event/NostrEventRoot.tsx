import { FollowEventRoot } from '@/components/modules/Follows/FollowEventRoot'
import { ListEmojiSetsRoot } from '@/components/modules/Lists/ListEmojiSetsRoot'
import { ListEventRoot } from '@/components/modules/Lists/ListEventRoot'
import { EventProvider } from '@/components/providers/NoteProvider'
import { Kind, isListKind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { memo } from 'react'
import { PostActions } from '../Posts/PostActions/PostActions'
import { PostRoot } from '../Posts/PostRoot'
import { RepostRoot } from '../Repost/Repost'
import { ThreadRelated } from '../Threads/ThreadRelated'
import { Threads } from '../Threads/Threads'
import { UserRoot } from '../User/UserRoot'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventHeader } from './NostrEventHeader'
import { NostrEventUnsupportedContent } from './NostrEventUnsupportedContent'

type Props = {
  event: NostrEventDB
}

export const ContentRoot = memo(function NostrEventRoot(props: Props) {
  const { event } = props
  switch (event.kind) {
    case Kind.Metadata: {
      return <UserRoot pubkey={event.pubkey} />
    }
    case Kind.Comment:
    case Kind.Highlight:
    case Kind.Text: {
      return event.metadata?.isRoot ? (
        <PostRoot event={event} />
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
    case Kind.Article: {
      return <PostRoot event={event} />
    }
    case Kind.Repost: {
      return <RepostRoot event={event} />
    }
    case Kind.Media:
    case Kind.Video:
    case Kind.ShortVideo:
    case Kind.PublicMessage: {
      return <PostRoot event={event} />
    }
    case Kind.ZapReceipt: {
      return <ZapReceiptRoot event={event} />
    }
    case Kind.EmojiSets: {
      return <ListEmojiSetsRoot event={event} />
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

const Item = memo(function Item(props: Props) {
  const { event } = props
  if (event.kind === Kind.Text && !event.metadata?.isRoot) {
    return (
      <>
        <Threads event={event} renderReplies renderRepliesSummary={false} />
        <ThreadRelated event={event} />
      </>
    )
  }

  return (
    <>
      <NostrEventHeader event={event} />
      <ContentRoot event={event} />
      <PostActions />
    </>
  )
})

export const NostrEventRoot = memo(function NostrEventRoot(props: Props) {
  const { event } = props
  return (
    <EventProvider value={{ event }}>
      <Item event={event} />
    </EventProvider>
  )
})
