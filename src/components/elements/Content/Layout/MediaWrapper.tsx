import { mediaDimsAtom } from '@/atoms/media.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { MediaMode } from '@/hooks/useMediaStore'
import { adjustDimensions, MAX_BOUNDS, MIN_HEIGHT } from '@/hooks/useMediaStore'
import { useSM } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import { useAtomValue } from 'jotai'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'

export type Props = {
  src: string
  mode?: MediaMode
  fixed?: boolean
  children: React.ReactNode
  fixedHeight?: number
  event?: NostrEventDB
  sx?: SxProps
}

export const MediaWrapper = memo(function MediaWrapper(props: Props) {
  const { src, children, fixedHeight, sx, event, fixed, mode = 'single' } = props
  const { dense } = useContentContext()
  const isMobile = useSM()
  const dim = event?.metadata?.imeta?.[src]?.dim
  const dims = useAtomValue(mediaDimsAtom)

  const width = dims.get(src)?.[0] || dim?.width
  const height = dims.get(src)?.[1] || dim?.height

  let adjusted = null
  if (width && height) {
    adjusted = adjustDimensions(width, height, {
      maxWidth: MAX_BOUNDS[mode].maxWidth,
      maxHeight: fixedHeight || MAX_BOUNDS[mode].maxHeight,
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
        styles.maxBounds(MAX_BOUNDS[mode].maxWidth, MAX_BOUNDS[mode].maxHeight),
        sx,
      ]}>
      {children}
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
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
    minHeight: 152,
  },
  padding: {
    marginBlock: spacing.margin2,
    marginInline: spacing.margin2,
  },
  bounds: (width: number, height: number) => ({ width, height }),
  maxBounds: (maxWidth: number, maxHeight: number) => ({ maxWidth, maxHeight }),
})
