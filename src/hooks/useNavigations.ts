import { useRouter, useRouterState } from '@tanstack/react-router'
import { useCallback } from 'react'

export function useGoBack() {
  const router = useRouter()
  const goBack = useCallback(() => {
    const { from } = router.state.location.state as { from?: string }
    return from ? router.history.back() : router.navigate({ to: '/' })
  }, [router])
  return goBack
}

export function useCurrentRoute() {
  const matches = useRouterState({ select: (x) => x.matches })
  return matches[matches.length - 1]
}

export function useNostrRoute() {
  const current = useCurrentRoute()
  if ('decoded' in (current.context || {})) {
    return current
  }
  return null
}
