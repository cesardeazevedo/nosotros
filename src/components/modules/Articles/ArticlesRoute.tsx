import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { useResetScroll } from '@/hooks/useResetScroll'
import { articleRoute } from '@/Router'
import { Feed } from '../Feed/Feed'
import { ArticlesHeader } from './ArticlesHeader'

export const ArticlesRoute = () => {
  const { module } = articleRoute.useLoaderData()
  useResetScroll()
  return (
    <RouteContainer header={<ArticlesHeader />}>
      <Feed feed={module.feed} />
    </RouteContainer>
  )
}
