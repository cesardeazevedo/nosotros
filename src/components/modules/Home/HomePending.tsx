import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { RouteContainer } from '../../elements/Layouts/RouteContainer'

export const HomePending = () => {
  return (
    <RouteContainer>
      <PostLoading rows={4} />
    </RouteContainer>
  )
}
