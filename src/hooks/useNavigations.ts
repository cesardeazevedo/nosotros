import { useMatch, useRouter, useRouterState } from '@tanstack/react-router'
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
  return useMatch({ from: '/$nostr', shouldThrow: false })?.context
}

export function useIsCurrentRouteEventID(id: string) {
  const context = useNostrRoute()
  if (context?.decoded) {
    switch (context.decoded.type) {
      case 'note': {
        return context.decoded.data === id
      }
      case 'nevent': {
        return context.decoded.data.id === id
      }
      case 'npub': {
        return context.decoded.data === id
      }
      case 'nprofile': {
        return context.decoded.data.pubkey === id
      }
    }
  }
}
