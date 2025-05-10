import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeFace } from '@/themes/typeFace.stylex'
import React from 'react'
import { css, html } from 'react-strict-dom'
import { LinkRelayFeed } from '../../Links/LinkRelayFeed'
import { RelayPopoverLink } from '../../Relays/RelayPopoverLink'

type Props = {
  href: string
  underline?: boolean
  shrink?: boolean
  children?: React.ReactNode | string
}

export const ContentLink = (props: Props) => {
  const { href, underline = true, shrink = true } = props
  const isLongLink = (href?.length || 0) > 36
  const sx = [styles.root, underline && styles.root$underline, shrink && styles.shrink] as SxProps
  const content = (
    <html.a href={href} target='_blank' rel='noopener noreferrer' style={sx}>
      {props.children}
    </html.a>
  )
  const isRelayLink = href?.startsWith('wss://')
  if (isRelayLink) {
    return (
      <RelayPopoverLink url={href}>
        <LinkRelayFeed url={formatRelayUrl(href)} sx={sx}>
          {props.children}
        </LinkRelayFeed>
      </RelayPopoverLink>
    )
  }
  if (isLongLink && href) {
    return <Tooltip text={href}>{content}</Tooltip>
  }
  return <>{content}</>
}

const styles = css.create({
  root: {
    color: palette.tertiary,
    fontWeight: typeFace.bold,
    display: 'inline-block',
    verticalAlign: 'top',
  },
  root$underline: {
    ':hover': {
      textDecoration: 'underline',
    },
  },
  shrink: {
    display: '-webkit-inline-box',
    WebkitLineClamp: 3,
    overflow: 'hidden',
    boxOrient: 'vertical',
    WebkitBoxOrient: 'vertical',
  },
  background: {
    paddingInline: spacing['padding1'],
    backgroundColor: palette.surfaceContainer,
    borderRadius: shape.lg,
  },
})
