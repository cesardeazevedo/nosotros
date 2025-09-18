import { mediaDimsAtom } from '@/atoms/media.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { adjustDimensions, MAX_BOUNDS, MIN_HEIGHT } from '@/hooks/useMediaStore'
import { useMobile } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import { useAtomValue } from 'jotai'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
  src: string
  size?: keyof typeof MAX_BOUNDS
  fixed?: boolean
  fixedHeight?: number
  event?: NostrEventDB
  sx?: SxProps
}

export const MediaWrapper = memo(function MediaWrapper(props: Props) {
  const { src, children, fixedHeight, sx, event, fixed } = props
  const { dense } = useContentContext()
  const isMobile = useMobile()
  const dim = event?.metadata?.imeta?.[src]?.dim
  const dims = useAtomValue(mediaDimsAtom)
  const size = isMobile ? 'sm' : props.size || 'md'

  const width = dims.get(src)?.[0] || dim?.width
  const height = dims.get(src)?.[1] || dim?.height

  let adjusted = null
  if (width && height) {
    adjusted = adjustDimensions(width, height, {
      maxWidth: MAX_BOUNDS[size].maxWidth,
      maxHeight: fixedHeight || MAX_BOUNDS[size].maxHeight,
    })
  }

  return (
    <html.div
      style={[
        styles.root,
        styles.padding,
        dense && styles.root$dense,
        isMobile && styles.root$mobile,
        fixed && adjusted && adjusted.height < MIN_HEIGHT && styles.minHeight,
        fixed && adjusted ? styles.bounds(adjusted.width, adjusted.height) : null,
        styles.maxBounds(MAX_BOUNDS[size].maxWidth, MAX_BOUNDS[size].maxHeight),
        sx,
      ]}>
      {children}
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    width: 'fit-content',
  },
  root$dense: {
    // this is likely rendered on replies
    marginBlock: spacing.margin1,
    marginLeft: 0,
  },
  root$mobile: {
    maxWidth: 'calc(100vw - 90px)',
  },
  minHeight: {
    minHeight: 180,
  },
  padding: {
    marginBlock: spacing.margin2,
    marginInline: spacing.margin2,
  },
  bounds: (width: number, height: number) => ({ width, height }),
  maxBounds: (maxWidth: number, maxHeight: number) => ({ maxWidth, maxHeight }),
})
