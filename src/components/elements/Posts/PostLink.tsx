import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNIP19 } from '@/hooks/useEventUtils'
import { useIsCurrentRouteEventID } from '@/hooks/useNavigations'
import { useNostrMaskedLinkProps, useNostrNavigationScope } from '@/hooks/useNostrMaskedLinkProps'
import { shape } from '@/themes/shape.stylex'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { memo, useCallback, type ReactNode } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'

type Props = {
  event: NostrEventDB
  children: ReactNode
  onClick?: () => void
}

export const PostLink = memo(function PostLink(props: Props) {
  const { event, children } = props
  const router = useRouter()
  const navigate = useNavigate()
  const scope = useNostrNavigationScope()
  const nip19 = useNIP19(event)
  const linkProps = useNostrMaskedLinkProps(nip19, scope)
  const columnLinkProps = useNostrMaskedLinkProps(nip19, 'column')
  const isActive = useIsCurrentRouteEventID(event)

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      if (e.metaKey) {
        const { href } = router.buildLocation(linkProps)
        window.open(href, '_blank', 'noopener, noreferrer')
        return
      }

      if (e.shiftKey) {
        navigate({
          ...columnLinkProps,
          state: { from: router.latestLocation.pathname, scope: 'column' } as never,
        })
        return
      }

      navigate({
        ...linkProps,
        state: { from: router.latestLocation.pathname, scope } as never,
      })
    },
    [event, linkProps, columnLinkProps, scope],
  )

  return (
    <html.div onClick={!isActive ? handleClick : undefined} style={[styles.root, !isActive && styles.action]}>
      {children}
    </html.div>
  )
})

const styles = css.create({
  root: {
    scrollMarginTop: 64,
  },
  action: {
    cursor: 'pointer',
    borderRadius: shape.lg,
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.06)',
    },
  },
})
