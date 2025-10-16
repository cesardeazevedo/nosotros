import { useMatch, useRouter, useRouterState } from '@tanstack/react-router'
import { nip19 } from 'nostr-tools'
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
  const maskedParam = useMatch({ from: '__root__', select: (x) => x.search.nostr, shouldThrow: false })
  const decoded = context ? context.decoded : maskedParam ? nip19.decode(maskedParam) : undefined
  if (decoded) {
    switch (decoded.type) {
      case 'note': {
        return decoded.data === id
      }
      case 'nevent': {
        return decoded.data.id === id
      }
      case 'npub': {
        return decoded.data === id
      }
      case 'nprofile': {
        return decoded.data.pubkey === id
      }
    }
  }
}
