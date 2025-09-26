import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { createHomeFeedModule } from '@/hooks/modules/createHomeFeedModule'
import { useFeedState } from '@/hooks/state/useFeed'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useResetScroll } from '@/hooks/useResetScroll'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { memo, useMemo } from 'react'
import { Feed } from '../Feed/Feed'
import { FeedHeadline } from '../Feed/FeedHeadline'
import { HomeHeader } from './HomeHeader'

type Props = {
  replies?: boolean
}

export const HomeRoute = memo(function HomeRoute(props: Props) {
  useResetScroll()
  const { replies = false } = props
  const navigate = useNavigate()
  const pubkey = useCurrentPubkey()
  const isThreadsRoute = !!useMatch({ from: '/threads', shouldThrow: false })
  const module = useMemo(() => {
    return {
      ...createHomeFeedModule(pubkey),
      includeReplies: replies,
    }
  }, [pubkey, replies])
  const feed = useFeedState(module)

  const handleChangeTabs = (anchor: string | undefined) => {
    feed.setPageSize(module.pageSize)
    navigate({ to: anchor === 'replies' ? '/threads' : '/' })
    if ((anchor === 'replies' && isThreadsRoute) || (anchor !== 'replies' && !isThreadsRoute)) {
      feed.onRefresh()
    }
  }

  return (
    <RouteContainer
      headline={<FeedHeadline feed={feed} />}
      header={<HomeHeader feed={feed} onChangeTabs={handleChangeTabs} />}>
      <Feed feed={feed} />
    </RouteContainer>
  )
})
