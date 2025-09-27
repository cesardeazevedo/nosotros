import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { createArticlesFeedModule } from '@/hooks/modules/createArticleFeedModule'
import { useFeedState } from '@/hooks/state/useFeed'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useMemo } from 'react'
import { Feed } from '../Feed/Feed'
import { ArticlesHeader } from './ArticlesHeader'
import { useResetScroll } from '@/hooks/useResetScroll'

export const ArticlesRoute = () => {
  useResetScroll()
  const pubkey = useCurrentPubkey()
  const module = useMemo(() => createArticlesFeedModule(pubkey), [pubkey])
  const feed = useFeedState(module)
  return (
    <RouteContainer header={<ArticlesHeader />}>
      <Feed feed={feed} />
    </RouteContainer>
  )
}
