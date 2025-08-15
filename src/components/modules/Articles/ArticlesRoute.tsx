import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { createArticlesFeedModule } from '@/hooks/modules/createArticleFeedModule'
import { useFeedState } from '@/hooks/state/useFeed'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useResetScroll } from '@/hooks/useResetScroll'
import { Feed } from '../Feed/Feed'
import { ArticlesHeader } from './ArticlesHeader'

export const ArticlesRoute = () => {
  const pubkey = useCurrentPubkey()
  const feed = useFeedState(createArticlesFeedModule(pubkey))
  useResetScroll()
  return (
    <RouteContainer header={<ArticlesHeader />}>
      <Feed feed={feed} />
    </RouteContainer>
  )
}
