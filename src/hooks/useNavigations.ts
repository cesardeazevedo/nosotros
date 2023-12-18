import { useRouter } from '@tanstack/react-router'
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
  return router.state.matches[router.state.matches.length - 1]
}
