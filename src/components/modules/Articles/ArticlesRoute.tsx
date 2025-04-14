import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { articleRoute } from '@/Router'
import { Feed } from '../Feed/Feed'
import { ArticlesHeader } from './ArticlesHeader'

export const ArticlesRoute = () => {
  const { module } = articleRoute.useLoaderData()
  return (
    <RouteContainer header={<ArticlesHeader />}>
      <Feed feed={module.feed} />
    </RouteContainer>
  )
}
