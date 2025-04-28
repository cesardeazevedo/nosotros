import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { useResetScroll } from '@/hooks/useResetScroll'
import { homeRoute } from '@/Router'
import { useRouter } from '@tanstack/react-router'
import { reaction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Feed } from '../Feed/Feed'
import { HomeHeader } from './HomeHeader'

export const HomeRoute = observer(function HomeRoute() {
  const router = useRouter()
  const { rootStore } = homeRoute.useRouteContext()
  const { module } = homeRoute.useLoaderData()
  useResetScroll()

  useEffect(() => {
    const disposer = reaction(
      () => [rootStore.auth.pubkey],
      () => router.invalidate(),
    )
    return () => disposer()
  }, [])

  return (
    <RouteContainer header={<HomeHeader module={module} />}>
      <Feed feed={module.feed} />
    </RouteContainer>
  )
})
