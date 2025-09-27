import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { MediaFeedModule } from '@/hooks/modules/createMediaFeedModule'
import { useMediaFeedState } from '@/hooks/state/useMediaFeed'
import { memo } from 'react'
import { MediaFeed } from './MediaFeed'
import { MediaHeader } from './MediaHeader'

type Props = {
  module: MediaFeedModule
}

export const MediaColumn = memo(function MediaColumn(props: Props) {
  const { module } = props
  const feed = useMediaFeedState(module)
  return (
    <div>
      <Stack horizontal={false}>
        <MediaHeader feed={feed} />
        <Divider />
        <MediaFeed column feed={feed} />
      </Stack>
    </div>
  )
})
