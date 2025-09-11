import { EditorProvider } from '@/components/elements/Editor/EditorProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useFeedState } from '@/hooks/state/useFeed'
import { memo } from 'react'
import { DeckColumnFeed } from '../Deck/DeckColumnFeed'
import { HomeHeader } from './HomeHeader'

type Props = {
  feedModule: FeedModule
}

export const HomeColumn = memo(function HomeColumn(props: Props) {
  const feed = useFeedState(props.feedModule)

  return (
    <DeckColumnFeed
      renderDivider={false}
      wrapper={(children) => (
        <>
          <EditorProvider queryKey={feed.options.queryKey} initialOpen={false} />
          <Divider />
          {children}
        </>
      )}
      header={
        <HomeHeader renderEditor={false} feed={feed} onChangeTabs={(tab) => feed.setReplies(tab === 'replies')} />
      }
      feed={feed}
    />
  )
})
