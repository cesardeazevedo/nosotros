import type { LinkProps } from '@tanstack/react-router'
import { useMatch } from '@tanstack/react-router'
import { useMemo } from 'react'

function useAllowedMaskedRoutes() {
  const isHome = useMatch({ from: '/', shouldThrow: false })
  const isFeed = useMatch({ from: '/feed', shouldThrow: false })
  const isSearch = useMatch({ from: '/search', shouldThrow: false })
  const isTag = useMatch({ from: '/tag/$tag', shouldThrow: false })
  const isNotifications = useMatch({ from: '/notifications', shouldThrow: false })
  const isArticles = useMatch({ from: '/articles', shouldThrow: false })
  const isMedia = useMatch({ from: '/media', shouldThrow: false })
  const isFollowSets = useMatch({ from: '/lists/followsets', shouldThrow: false })
  const isRelaySets = useMatch({ from: '/lists/relaysets', shouldThrow: false })
  const isNprofile = useMatch({
    from: '/$nostr',
    select: (x) => {
      switch (x.context.decoded?.type) {
        case 'nprofile':
        case 'npub':
          return true
      }
      return false
    },
    shouldThrow: false,
  })
  const isMaskable = Boolean(
    isHome ||
      isFeed ||
      isSearch ||
      isTag ||
      isNotifications ||
      isArticles ||
      isMedia ||
      isFollowSets ||
      isRelaySets ||
      isNprofile,
  )
  return isMaskable
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
