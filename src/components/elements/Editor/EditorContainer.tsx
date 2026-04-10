import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import React, { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  open?: boolean
  onClick?: () => void
  renderBubble?: boolean
  sx?: SxProps
  children: React.ReactNode
}

export const EditorContainer = memo(function EditorContainer(props: Props) {
  const { renderBubble, open, onClick, sx, children } = props
  const { dense } = useContentContext()
  return (
    <Stack
      horizontal={false}
      align='stretch'
      justify='space-between'
      onClick={() => onClick?.()}
      role='button'
      sx={[styles.root, open && styles.root$open, !renderBubble && styles.root$nonbubble, sx]}>
      <ContentProvider value={{ dense, disableLink: true, disablePopover: true }}>{children}</ContentProvider>
    </Stack>
  )
})

const styles = css.create({
  root: {
    cursor: 'pointer',
    width: '100%',
    padding: spacing.padding1,
    paddingLeft: spacing.padding2,
    paddingBlock: 20,
  },
  root$open: {
    cursor: 'inherit',
    paddingBlock: spacing.padding1,
    paddingTop: spacing.padding2,
  },
  root$nonbubble: {
    position: 'relative',
    isolation: 'isolate',
    borderRadius: 26,
    backgroundColor: palette.surfaceBright,
    boxShadow: elevation.shadows1,
    '::before': {
      content: '',
      position: 'absolute',
      inset: 0,
      padding: 1,
      borderRadius: 'inherit',
      backgroundImage: `conic-gradient(from var(--editor-border-angle), ${palette.outline} 0deg, ${palette.outline} 96deg, color-mix(in srgb, ${palette.primaryFixedDim} 4%, ${palette.outline}) 120deg, color-mix(in srgb, ${palette.primaryFixedDim} 8%, ${palette.outline}) 138deg, color-mix(in srgb, ${palette.primaryFixedDim} 14%, ${palette.outline}) 156deg, color-mix(in srgb, ${palette.primaryFixedDim} 20%, ${palette.outline}) 170deg, color-mix(in srgb, ${palette.primaryFixedDim} 24%, ${palette.outline}) 180deg, color-mix(in srgb, ${palette.primaryFixedDim} 20%, ${palette.outline}) 190deg, color-mix(in srgb, ${palette.primaryFixedDim} 14%, ${palette.outline}) 204deg, color-mix(in srgb, ${palette.primaryFixedDim} 8%, ${palette.outline}) 222deg, color-mix(in srgb, ${palette.primaryFixedDim} 4%, ${palette.outline}) 240deg, ${palette.outline} 264deg, ${palette.outline} 360deg)`,
      WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
      zIndex: -1,
      animationName: 'editor-border-spin',
      animationDuration: '10000ms',
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
    },
  },
})
