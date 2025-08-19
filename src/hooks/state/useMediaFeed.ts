import { useState } from 'react'
import type { MediaFeedModule } from '../modules/createMediaFeedModule'
import { useFeedState } from './useFeed'

export type MediaFeedState = ReturnType<typeof useMediaFeedState>

export function useMediaFeedState(module: MediaFeedModule) {
  const [layout, setLayout] = useState(module.layout)

  const feed = useFeedState(module)

  return {
    ...feed,
    layout,
    setLayout,
  }
}
