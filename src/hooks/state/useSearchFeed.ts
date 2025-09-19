import { useMemo } from 'react'
import { createSearchFeedModule } from '../modules/createSearchFeedModule'
import { useFeedState } from './useFeed'

export type FeedSearch = ReturnType<typeof useSearchFeed>

export function useSearchFeed(search: string = '') {
  const module = useMemo(() => createSearchFeedModule(search), [search])
  return useFeedState(module)
}
