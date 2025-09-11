import { ArticleFeedItem } from '@/components/modules/Articles/ArticleFeedItem'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useRepostedEvent } from '@/hooks/query/useQueryBase'
import { memo } from 'react'
import { PostRoot } from '../Posts/Post'
import { RepostHeader } from './RepostHeader'

type Props = {
  event: NostrEventDB
}

export const RepostRoot = memo(function RepostRoot(props: Props) {
  const { event } = props
  const { data: innerEvent } = useRepostedEvent(event)
  if (innerEvent) {
    switch (innerEvent.kind) {
      // people weren't supposed to be sharing articles with kind 6 events, but we lost the battle
      case Kind.Article: {
        return <ArticleFeedItem event={innerEvent} header={<RepostHeader event={event} />} />
      }
      default: {
        return <PostRoot event={innerEvent} header={<RepostHeader event={event} />} />
      }
    }
  }
  return null
})
