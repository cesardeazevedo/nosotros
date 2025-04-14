import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { RouteContainer } from '../../elements/Layouts/RouteContainer'
import { HomeHeader } from './HomeHeader'

export const HomePending = () => {
  return (
    <RouteContainer header={<HomeHeader />}>
      <PostLoading rows={4} />
    </RouteContainer>
  )
}
