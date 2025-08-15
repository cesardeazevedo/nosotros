import { EditorProvider } from '@/components/elements/Editor/EditorProvider'
import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { Divider } from '@/components/ui/Divider/Divider'
import { Kind } from '@/constants/kinds'
import { createMediaFeedModule } from '@/hooks/modules/createMediaFeedModule'
import { useMediaFeedState } from '@/hooks/state/useMediaFeed'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useResetScroll } from '@/hooks/useResetScroll'
import { MediaFeed } from './MediaFeed'
import { MediaHeader } from './MediaHeader'

export const MediaRoute = () => {
  const pubkey = useCurrentPubkey()
  const feed = useMediaFeedState(createMediaFeedModule(pubkey))
  useResetScroll()
  return (
    <RouteContainer header={<MediaHeader feed={feed} />}>
      <EditorProvider kind={Kind.Media} queryKey={feed.options.queryKey} initialOpen={false} />
      <Divider />
      <MediaFeed feed={feed} />
    </RouteContainer>
  )
}
