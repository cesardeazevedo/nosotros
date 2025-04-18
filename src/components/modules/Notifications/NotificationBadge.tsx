import { Anchored } from '@/components/ui/Anchored/Anchored'
import { Badge } from '@/components/ui/Badge/Badge'
import { useCurrentAccount } from '@/hooks/useRootStore'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'

type Props = {
  children: React.ReactNode
}

export const NotificationBadge = observer(function NotificationBadge(props: Props) {
  const router = useRouter()
  const account = useCurrentAccount()
  const module = useRouterState({
    select: (state) => {
      const match = state.cachedMatches.find((x) => x.routeId === '/notifications')
      return match?.loaderData
    },
  })

  useEffect(() => {
    async function preload() {
      try {
        if (router.latestLocation.pathname !== '/notifications') {
          await router.preloadRoute({ to: '/notifications' })
        }
      } catch (error) {
        console.log(error)
      }
    }
    preload()
  }, [router])

  const value = module?.feed.unseen(account?.lastSeen.notification || 0).length || 0

  return <Anchored content={<Badge maxValue={999} value={value} />}>{props.children}</Anchored>
})
