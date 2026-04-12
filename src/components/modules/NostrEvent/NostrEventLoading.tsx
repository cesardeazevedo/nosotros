import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { NavigationHeader } from '@/components/elements/Navigation/NavigationHeader'
import { PostLoading } from '@/components/elements/Posts/PostLoading'

export const NostrEventPending = () => {
  return (
    <RouteContainer header={<NavigationHeader />}>
      <PostLoading rows={1} />
    </RouteContainer>
  )
}
