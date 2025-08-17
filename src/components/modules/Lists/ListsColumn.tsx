import { Kind } from '@/constants/kinds'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useFeedState } from '@/hooks/state/useFeed'
import { DeckColumnFeed } from '../Deck/DeckColumnFeed'
import { FeedHeader } from '../Feed/FeedHeader'
import { FollowSetCard } from './FollowSets/FollowSetCard'
import { RelaySetItem } from './RelaySets/RelaySetItem'

type Props = {
  module: FeedModule
}

export const ListsColumn = (props: Props) => {
  const feed = useFeedState(props.module)
  return (
    <DeckColumnFeed
      feed={feed}
      wrapper={(children) => <>{children}</>}
      render={(event) => {
        switch (event.kind) {
          case Kind.RelaySets: {
            return <RelaySetItem event={event} />
          }
          case Kind.FollowSets: {
            return <FollowSetCard event={event} />
          }
        }
      }}
      settings={<></>}
      header={<FeedHeader feed={feed} />}
    />
  )
}
