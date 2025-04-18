import type { FeedModule } from '@/stores/modules/feed.module'
import { DeckColumnHeader } from '../Deck/DeckColumnHeader'
import { DeckScroll } from '../Deck/DeckScroll'
import { Feed } from '../Feed/Feed'
import { SearchHeader } from './SearchHeader'
import { SearchSettings } from './SearchSettings'

type Props = {
  module: FeedModule
}

export const SearchColumn = (props: Props) => {
  const { module } = props
  return (
    <>
      <DeckColumnHeader id={module.id} leading={<SearchHeader module={module} updateSearchParams={false} />}>
        <SearchSettings renderSearchField={false} module={module} />
      </DeckColumnHeader>
      <DeckScroll>
        <Feed column feed={module.feed} />
      </DeckScroll>
    </>
  )
}
