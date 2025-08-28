import { mediaDimsAtom } from '@/atoms/media.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Kind } from '@/constants/kinds'
import { spacing } from '@/themes/spacing.stylex'
import { useAtomValue } from 'jotai'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
  src: string
  size?: keyof typeof MAX_BOUNDS
  fixedHeight?: number
  disablePadding?: boolean
}

const MAX_BOUNDS = {
  sm: {
    maxWidth: 390,
    maxHeight: 410,
  },
  md: {
    maxWidth: 460,
    maxHeight: 480,
  },
  lg: {
    maxWidth: 540,
    maxHeight: 560,
  },
} as const

function adjustDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const widthScale = maxWidth / width
  const heightScale = maxHeight / height

  const scaleFactor = Math.min(widthScale, heightScale)

  return {
    width: Math.floor(width * scaleFactor),
    height: Math.floor(height * scaleFactor),
  }
}

export const MediaWrapper = memo(function MediaWrapper(props: Props) {
  const { src, size = 'md', children } = props
  const { event } = useNoteContext()
  const { dense } = useContentContext()
  const dim = event.metadata?.imeta?.[src]?.dim
  const dims = useAtomValue(mediaDimsAtom)
  const width = dims.get(src)?.[0] || dim?.width
  const height = dims.get(src)?.[1] || dim?.height
  const adjusted =
    width && height && event.kind === Kind.Media
      ? adjustDimensions(width, height, MAX_BOUNDS[size].maxWidth, MAX_BOUNDS[size].maxWidth)
      : null

  return (
    <html.div
      style={[
        styles.padding,
        dense && styles.root$dense,
        adjusted ? styles.bounds(adjusted.width, adjusted.height) : null,
      ]}>
      {children}
    </html.div>
  )
})

const styles = css.create({
  root: {
    marginBlock: spacing.margin2,
    maxInlineSize: '100%',
    maxBlockSize: 'fit-content',
    overflow: 'hidden',
  },
  root$dense: {
    marginBlock: spacing.margin1,
    paddingLeft: 0,
    paddingRight: 0,
  },
  padding: {
    marginBlock: spacing.margin2,
    paddingLeft: spacing.padding2,
    paddingRight: spacing.padding2,
  },
  bounds: (width: number, height: number) => ({ width, height }),
})
