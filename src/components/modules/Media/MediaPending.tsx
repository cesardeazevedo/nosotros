import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { MediaFeedHeader } from './MediaHeader'

export const MediaPending = () => {
  return (
    <RouteContainer header={<MediaFeedHeader />}>
      <PostLoading rows={4} />
    </RouteContainer>
  )
}
