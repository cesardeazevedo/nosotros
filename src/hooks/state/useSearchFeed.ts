import { createSearchFeedModule } from '../modules/createSearchFeedModule'
import { useFeedState } from './useFeed'

export type FeedSearch = ReturnType<typeof useSearchFeed>

export function useSearchFeed(search: string = '') {
  const options = createSearchFeedModule(search)
  const feed = useFeedState(options)
  return feed
}
