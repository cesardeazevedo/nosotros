import type { SxProps } from '@/components/ui/types'
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
    width: '100%',
    wordBreak: 'break-word',
    borderRadius: shape.xl,
    display: 'inline-block',
    transition: 'background-color 0.18s ease',
    backgroundColor: palette.surfaceContainer,
  },
  highlight: {
    backgroundColor: {
      default: palette.surfaceContainer,
      ':hover': palette.surfaceContainerHigh,
    },
  },
})
