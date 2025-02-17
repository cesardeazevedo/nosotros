import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { mediaStore } from '@/stores/media/media.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
  src: string
  size?: 'sm' | 'md'
  fixedHeight?: number
  disablePadding?: boolean
}

const MAX_BOUNDS = {
  sm: {
    maxWidth: 320,
    maxHeight: 400,
  },
  md: {
    maxWidth: 440,
    maxHeight: 460,
  },
} as const

// eslint-disable-next-line react-refresh/only-export-components
export function adjustDimensions(
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

// Handles width and height for Image and Video components if imeta tag is present
// it defaults to max-width and max-height if they are not. This component also abstract lots ofduplicated
// duplicated styles on Image and Video components, making a lot easier to work with
export const MediaWrapper = observer(function MediaWrapper(props: Props) {
  const { src, size = 'md', fixedHeight, disablePadding = false, children } = props
  const { note } = useNoteContext()
  const { dense } = useContentContext()
  const dim = note.metadata.imeta?.[src]?.dim
  const width = mediaStore.dims.get(src)?.[0] || dim?.width
  const height = mediaStore.dims.get(src)?.[1] || dim?.height
  const adjusted =
    width && height ? adjustDimensions(width, height, MAX_BOUNDS[size].maxWidth, MAX_BOUNDS[size].maxWidth) : null
  return (
    <>
      <html.div
        style={[
          styles.root,
          !disablePadding && styles.padding,
          dense && styles.root$dense,
          adjusted ? styles.bounds(adjusted.width, adjusted.height) : styles[`size$${size}`],
          !!fixedHeight && styles.fixedHeight(fixedHeight),
        ]}>
        {children}
      </html.div>
    </>
  )
})

const MOBILE = '@media (max-width: 599.95px)'

const styles = css.create({
  root: {
    marginBlock: spacing.margin2,
  },
  root$dense: {
    marginBlock: spacing.margin1,
    paddingLeft: 0,
  },
  padding: {
    paddingLeft: spacing.padding2,
  },
  size$md: {
    maxHeight: MAX_BOUNDS.md.maxHeight,
    maxWidth: {
      default: MAX_BOUNDS.md.maxWidth,
      [MOBILE]: 'calc(100vw - 90px)',
    },
  },
  size$sm: {
    maxHeight: MAX_BOUNDS.sm.maxHeight,
    maxWidth: {
      default: MAX_BOUNDS.sm.maxWidth,
      [MOBILE]: 'calc(100vw - 90px)',
    },
  },
  fixedHeight: (height: number) => ({ height }),
  bounds: (width: number, height: number) => ({ width, height }),
})
