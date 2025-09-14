import { mediaDimsAtom } from '@/atoms/media.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { adjustDimensions, MAX_BOUNDS } from '@/hooks/useMediaStore'
import { useMobile } from '@/hooks/useMobile'
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
  const { src, children, fixedHeight } = props
  const { event } = useNoteContext()
  const { dense } = useContentContext()
  const isMobile = useMobile()
  const dim = event.metadata?.imeta?.[src]?.dim
  const dims = useAtomValue(mediaDimsAtom)
  const size = isMobile ? 'sm' : props.size || 'md'

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
  root$dense: {
    // this is likely rendered on replies
    maxWidth: 'calc(100vw - 90px)',
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
