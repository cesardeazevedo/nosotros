import { NostrEvent } from '@/core/types'
import { getEventId } from '@/utils/nip19'
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
  const matches = useRouterState().matches
  return matches[matches.length - 1]
}

export function useNostrRoute() {
  const context = useMatch({ from: '/$nostr', shouldThrow: false })?.context
  const maskedParam = useMatch({ from: '__root__', select: (x) => x.search.nostr, shouldThrow: false })
  return context || (maskedParam ? { decoded: nip19.decode(maskedParam) } : undefined)
}

export function useIsCurrentRouteEventID(event: NostrEvent) {
  const context = useNostrRoute()
  const id = getEventId(event)
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
      case 'naddr': {
        const { kind, pubkey, identifier } = context.decoded.data
        const address = [kind, pubkey, identifier].join(':')
        return address === id
      }
      default: {
        return false
      }
    }
  }
  return false
}
