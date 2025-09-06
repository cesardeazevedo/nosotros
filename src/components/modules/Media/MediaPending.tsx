import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'

export const MediaPending = () => {
  return (
    <RouteContainer>
      <PostLoading rows={4} />
    </RouteContainer>
  )
}
