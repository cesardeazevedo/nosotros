import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { ArticlesHeader } from './ArticlesHeader'

export const ArticlesPending = () => {
  return (
    <RouteContainer header={<ArticlesHeader />}>
      <PostLoading rows={4} />
    </RouteContainer>
  )
}
