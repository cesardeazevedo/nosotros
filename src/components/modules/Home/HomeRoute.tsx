import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { createHomeFeedModule } from '@/hooks/modules/createHomeFeedModule'
import { useFeedState } from '@/hooks/state/useFeed'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useNavigate } from '@tanstack/react-router'
import { memo, useMemo } from 'react'
import { Feed } from '../Feed/Feed'
import { HomeHeader } from './HomeHeader'
import { useResetScroll } from '@/hooks/useResetScroll'

type Props = {
  replies?: boolean
}

export const HomeRoute = memo(function HomeRoute(props: Props) {
  useResetScroll()
  const { replies = false } = props
  const navigate = useNavigate()
  const pubkey = useCurrentPubkey()
  const module = useMemo(() => {
    return {
      ...createHomeFeedModule(pubkey),
      includeReplies: replies,
    }
  }, [pubkey, replies])
  const feed = useFeedState(module)

  const handleChangeTabs = (anchor: string | undefined) => {
    navigate({ to: anchor === 'replies' ? '/threads' : '/' })
  }

  return (
    <RouteContainer header={<HomeHeader feed={feed} onChangeTabs={handleChangeTabs} />}>
      <Feed feed={feed} />
    </RouteContainer>
  )
})
