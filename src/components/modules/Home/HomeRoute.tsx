import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { createHomeFeedModule } from '@/hooks/modules/createHomeFeedModule'
import { useFeedState } from '@/hooks/state/useFeed'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useResetScroll } from '@/hooks/useResetScroll'
import { useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { Feed } from '../Feed/Feed'
import { HomeHeader } from './HomeHeader'

type Props = {
  replies?: boolean
}

export const HomeRoute = memo(function HomeRoute(props: Props) {
  const navigate = useNavigate()
  const pubkey = useCurrentPubkey()
  const feed = useFeedState({ ...createHomeFeedModule(pubkey), includeReplies: props.replies })

  const handleChangeTabs = (anchor: string | undefined) => {
    navigate({ to: anchor === 'replies' ? '/replies' : '/' })
  }

  useResetScroll()

  return (
    <RouteContainer header={<HomeHeader feed={feed} onChangeTabs={handleChangeTabs} />}>
      <Feed feed={feed} />
    </RouteContainer>
  )
})
