import { useContentContext } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { useNprofile } from '@/hooks/useEventUtils'
import { useNostrMaskedLinkProps, useNostrNavigationScope } from '@/hooks/useNostrMaskedLinkProps'
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
  const scope = useNostrNavigationScope()

  const allStyles = [styles.cursor, underline && !disableLink && styles.underline, sx]

  const linkMaskedProps = useNostrMaskedLinkProps(nprofile, scope)

  if (disableLink || !nprofile) {
    return <html.span style={allStyles}>{children}</html.span>
  }

  return (
    <Link
      {...linkMaskedProps}
      state={{ from: router.latestLocation.pathname, scope } as never}
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
