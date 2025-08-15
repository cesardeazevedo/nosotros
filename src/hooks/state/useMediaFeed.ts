import { useState } from 'react'
import type { MediaFeedModule } from '../modules/createMediaFeedModule'
import { useFeedState } from './useFeed'

export type MediaFeedState = ReturnType<typeof useMediaFeedState>

export function useMediaFeedState(feedOptions: MediaFeedModule) {
  const [layout, setLayout] = useState(feedOptions.layout)

  const feed = useFeedState(feedOptions)

  return {
    ...feed,
    layout,
    setLayout,
  }
}
