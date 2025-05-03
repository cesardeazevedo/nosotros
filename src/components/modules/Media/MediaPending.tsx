import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { MediaHeader } from './MediaHeader'

export const MediaPending = () => {
  return (
    <RouteContainer header={<MediaHeader />}>
      <PostLoading rows={4} />
    </RouteContainer>
  )
}
