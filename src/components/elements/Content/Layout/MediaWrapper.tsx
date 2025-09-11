import { mediaDimsAtom } from '@/atoms/media.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { adjustDimensions, MAX_BOUNDS } from '@/hooks/useMediaStore'
import { spacing } from '@/themes/spacing.stylex'
import { useAtomValue } from 'jotai'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
  src: string
  size?: keyof typeof MAX_BOUNDS
  fixedHeight?: number | null
}

export const MediaWrapper = memo(function MediaWrapper(props: Props) {
  const { src, size = 'md', children, fixedHeight } = props
  const { event } = useNoteContext()
  const { dense } = useContentContext()
  const dim = event.metadata?.imeta?.[src]?.dim
  const dims = useAtomValue(mediaDimsAtom)

  const width = dims.get(src)?.[0] || dim?.width
  const height = dims.get(src)?.[1] || dim?.height

  let adjusted = null
  if (width && height) {
    adjusted = adjustDimensions(width, height, MAX_BOUNDS[size].maxWidth, fixedHeight || MAX_BOUNDS[size].maxHeight)
  }

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
  },
  bounds: (width: number, height: number) => ({ width, height }),
})
