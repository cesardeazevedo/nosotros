import { EditorProvider } from '@/components/elements/Editor/EditorProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { createHomeFeedModule } from '@/hooks/modules/createHomeFeedModule'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useFeedState } from '@/hooks/state/useFeed'
import { memo, useMemo } from 'react'
import { DeckColumnFeed } from '../Deck/DeckColumnFeed'
import { HomeHeader } from './HomeHeader'

type Props = {
  module: FeedModule
}

export const HomeColumn = memo(function HomeColumn(props: Props) {
  const { module } = props
  const data = useMemo(() => {
    return {
      ...createHomeFeedModule(module.filter.authors?.[0]),
      ...module,
    }
  }, [module])

  const feed = useFeedState(data)

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
        <HomeHeader
          renderEditor={false}
          feed={feed}
          onChangeTabs={(tab) => {
            const isReplies = tab === 'replies'
            if (isReplies !== feed.replies) {
              feed.setReplies(isReplies)
              feed.saveFeed()
            } else {
              feed.onRefresh()
            }
          }}
        />
      }
      feed={feed}
    />
  )
})
