import { useDeckAddNextColumn } from '@/components/modules/Deck/hooks/useDeck'
import { useContentContext } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { createProfileModule } from '@/hooks/modules/createProfileFeedModule'
import { useNprofile } from '@/hooks/useEventUtils'
import { useNostrMaskedLinkProps } from '@/hooks/useNostrMasedLinkProps'
import { Link, useRouter } from '@tanstack/react-router'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

interface Props {
  sx?: SxProps
  pubkey: string
  underline?: boolean
  children: React.ReactNode
}

export const LinkProfile = memo(function LinkProfile(props: Props) {
  const { pubkey, underline, children, sx, ...rest } = props
  const { disableLink } = useContentContext()
  const router = useRouter()
  const nprofile = useNprofile(pubkey)

  const deck = useDeckAddNextColumn(() => createProfileModule({ nip19: nprofile }))
  const allStyles = [styles.cursor, underline && !disableLink && styles.underline, sx]

  const linkMaskedProps = useNostrMaskedLinkProps(nprofile)

  if (disableLink || !nprofile) {
    return <html.span style={allStyles}>{children}</html.span>
  }

  if (deck.isDeck) {
    return (
      <html.a onClick={deck.add} {...rest} style={allStyles}>
        {children}
      </html.a>
    )
  }

  return (
    <Link
      {...linkMaskedProps}
      state={{ from: router.latestLocation.pathname } as never}
      onClick={(e) => e.stopPropagation()}
      {...rest}
      {...css.props(allStyles)}>
      {children}
    </Link>
  )
})

const styles = css.create({
  cursor: {
    cursor: 'pointer',
    display: 'inline',
  },
  underline: {
    textDecoration: {
      default: 'inherit',
      ':hover': 'underline',
    },
  },
})
