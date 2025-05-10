import type { FeedModule } from '@/stores/modules/feed.module'
import { DeckScroll } from '../Deck/DeckScroll'
import { Feed } from '../Feed/Feed'
import { SearchHeader } from './SearchHeader'
import { SearchSettings } from './SearchSettings'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'

type Props = {
  module: FeedModule
}

export const SearchColumn = (props: Props) => {
  const { module } = props
  return (
    <Stack horizontal={false}>
      <FeedHeaderBase
        feed={module.feed}
        leading={<SearchHeader module={module} updateSearchParams={false} />}
        customSettings={<SearchSettings renderSearchField={false} module={module} />}
      />
      <Divider />
      <DeckScroll>
        <Feed column feed={module.feed} />
      </DeckScroll>
    </Stack>
  )
}
