import { EventProvider } from '@/components/providers/NoteProvider'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useRepostedEvent } from '@/hooks/query/useQueryBase'
import { memo } from 'react'
// import { PostFeedItem } from '../Posts/PostFeedItem'
import { NostrEventContent } from '../Event/NostrEventFeedItem'

type Props = {
  event: NostrEventDB
}

export const RepostRoot = memo(function RepostRoot(props: Props) {
  const { event } = props
  const { data: innerEvent } = useRepostedEvent(event)
  if (innerEvent) {
    return (
      <EventProvider value={{ event: innerEvent }}>
        <NostrEventContent event={innerEvent} />
      </EventProvider>
    )
  }
  return <h2>Unable to load reposted content</h2>
  // if (innerEvent) {
  //   switch (innerEvent.kind) {
  //     // people weren't supposed to be sharing articles with kind 6 events, but we lost the battle
  //     case Kind.Article: {
  //       return <ArticleFeedItem event={innerEvent} header={<RepostHeader event={event} />} />
  //     }
  //     default: {
  //       return <PostFeedItem event={innerEvent} />
  //     }
  //   }
  // } else {
  //   return <h2>Unable to load reposted content</h2>
  // }
  // return null
})
