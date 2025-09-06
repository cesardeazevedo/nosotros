import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useFeedState } from '@/hooks/state/useFeed'
import { memo } from 'react'
import { DeckScroll } from '../Deck/DeckScroll'
import { Feed } from '../Feed/Feed'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { SearchHeader } from './SearchHeader'
import { SearchSettings } from './SearchSettings'

type Props = {
  module: FeedModule
}

export const SearchColumn = memo(function SearchColumn(props: Props) {
  const { module } = props
  const feed = useFeedState(module)
  return (
    <Stack horizontal={false}>
      <FeedHeaderBase
        feed={feed}
        leading={<SearchHeader feed={feed} />}
        customSettings={<SearchSettings feed={feed} />}
      />
      <Divider />
      <DeckScroll>
        <Feed column feed={feed} />
      </DeckScroll>
    </Stack>
  )
})
