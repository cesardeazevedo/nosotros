import type { SxProps } from '@/components/ui/types'
import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import React from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  sx?: SxProps
  highlight?: boolean
  children: React.ReactNode
}

export const BubbleContainer = (props: Props) => (
  <html.div style={[styles.root, props.highlight !== false && styles.highlight, props.sx]}>{props.children}</html.div>
)

const styles = css.create({
  root: {
    paddingInline: '12px',
    paddingTop: '4px',
    paddingBottom: '6px',
    width: 'fit-content',
    wordBreak: 'break-word',
    borderRadius: shape.xl,
    display: 'inline-block',
    transition: 'background-color 0.18s ease',
    backgroundColor: palette.surfaceContainer,
  },
  highlight: {
    transition: 'transform',
    transitionDuration: duration.short3,
    transitionTimingFunction: easing.emphasized,
    transform: 'scale(1)',
    ':active': {
      transform: 'scale(0.96)',
    },
    backgroundColor: {
      default: palette.surfaceContainer,
      ':hover': palette.surfaceContainerHigh,
    },
  },
})
