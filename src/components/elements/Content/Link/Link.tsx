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
import { RelayIcon } from '../../Relays/RelayIcon'
import { RelayPopover } from '../../Relays/RelayPopover'

type Props = {
  href: string
  underline?: boolean
  shrink?: boolean
  children?: React.ReactNode | string
  sx?: SxProps
}

export const ContentLink = (props: Props) => {
  const { href, underline = true, shrink = true } = props
  const isLongLink = (href?.length || 0) > 36
  const sx = [styles.root, underline && styles.root$underline, shrink && styles.shrink, props.sx] as SxProps
  const content = (
    <html.a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      style={sx}
      onClick={(e) => {
        e.stopPropagation()
      }}>
      {props.children}
    </html.a>
  )
  const isRelayLink = href?.startsWith('wss://')
  if (isRelayLink) {
    return (
      <RelayPopover url={href}>
        <html.span style={styles.link}>
          <RelayIcon size='xxs' url={href} sx={styles.relay$avatar} />
          <LinkRelayFeed url={formatRelayUrl(href)} sx={sx}>
            {props.children}
          </LinkRelayFeed>
        </html.span>
      </RelayPopover>
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
  link: {
    display: 'inline',
    borderRadius: 6,
    backgroundColor: palette.surfaceContainer,
    paddingInline: 2,
    paddingTop: 1,
    paddingBottom: 1,
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
  relay$avatar: {
    position: 'relative',
    display: 'inline-block',
    width: 16,
    height: 16,
    top: -2,
    marginRight: 2,
  },
})
