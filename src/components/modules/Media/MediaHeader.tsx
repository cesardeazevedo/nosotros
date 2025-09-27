import type { MediaFeedState } from '@/hooks/state/useMediaFeed'
import { memo } from 'react'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { MediaSettings } from './MediaSettings'

type Props = {
  feed: MediaFeedState
}

export const MediaHeader = memo(function MediaHeader(props: Props) {
  const { feed } = props
  return (
    <FeedHeaderBase
      label='Media'
      feed={feed}
      customSettings={({ close }) => <MediaSettings feed={feed} onClose={close} />}
    />
  )
})
