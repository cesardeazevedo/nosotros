import type { LinkProps } from '@tanstack/react-router'
import { useRouterState } from '@tanstack/react-router'
import { useMemo } from 'react'

function useAllowedMaskedRoutes() {
  return useRouterState({
    select: (state) => {
      const { pathname } = state.location

      switch (pathname) {
        case '/':
        case '/feed':
        case '/search':
        case '/notifications':
        case '/articles':
        case '/media':
        case '/lists/followsets':
        case '/lists/relaysets':
          return true
      }

      // Check nprofile/npub route
      const nostrMatch = state.matches[state.matches.length - 1]
      if (nostrMatch.routeId === '/$nostr') {
        const decoded = nostrMatch.context?.decoded
        if (decoded?.type === 'nprofile' || decoded?.type === 'npub') {
          return true
        }
      }

      return false
    },
  })
}

export function useNostrMaskedLinkProps(nostr: string | undefined): LinkProps {
  const allowed = useAllowedMaskedRoutes()
  return useMemo(() => {
    if (allowed) {
      return {
        to: '.',
        search: (s) => ({ ...s, nostr }),
        mask: { to: `/$nostr`, params: { nostr }, unmaskOnReload: true },
      }
    }
    return {
      to: `/$nostr`,
      params: { nostr },
    }
  }, [nostr, allowed])
}
