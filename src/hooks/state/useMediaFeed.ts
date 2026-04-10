import { createMediaFeedAtoms } from '@/atoms/feed.media.atoms'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { type MediaFeedModule } from '../modules/createMediaFeedModule'
import { useFeedStateAtom } from './useFeed'

export type MediaFeedState = ReturnType<typeof useMediaFeedState>

export function useMediaFeedState(module: MediaFeedModule) {
  const feedAtoms = useMemo(() => createMediaFeedAtoms(module), [module])
  const [layout, setLayout] = useAtom(feedAtoms.layout)
  const feed = useFeedStateAtom(feedAtoms)

  return {
    ...feed,
    layout,
    setLayout,
  }
}
