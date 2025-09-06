import { Divider } from '@/components/ui/Divider/Divider'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useFeedState } from '@/hooks/state/useFeed'
import { memo } from 'react'
import { DeckColumnFeed } from '../Deck/DeckColumnFeed'
import { ArticlesHeader } from './ArticlesHeader'

type Props = {
  module: FeedModule
}

export const ArticlesColumn = memo(function ArticlesColumn(props: Props) {
  const { module } = props
  const feed = useFeedState(module)

  return (
    <DeckColumnFeed
      renderDivider={false}
      header={
        <>
          <ArticlesHeader />
          <Divider />
        </>
      }
      feed={feed}
    />
  )
})
