import { useRouter, type RouteMatch } from '@tanstack/react-router'
import type { nostrRoute } from 'Router'
import { useCallback } from 'react'

export function useGoBack() {
  const router = useRouter()
  const goBack = useCallback(() => {
    const { from } = router.state.location.state as { from?: string }
    from ? router.history.back() : router.navigate({ to: '/' })
  }, [router])
  return goBack
}

export function useCurrentRoute() {
  const router = useRouter()
  return router.state.matches[router.state.matches.length - 1] as RouteMatch
}

export function useNostrRoute() {
  const current = useCurrentRoute()
  if ((current as RouteMatch<typeof nostrRoute>).context?.decoded !== undefined) {
    return current as RouteMatch<typeof nostrRoute>
  }
  return null
}
