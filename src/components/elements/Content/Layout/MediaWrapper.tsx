import { useContentContext } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import type { MediaMode } from '@/hooks/useMediaStore'
import { MAX_BOUNDS } from '@/hooks/useMediaStore'
import { useSM } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'

export type Props = {
  mode?: MediaMode
  children: React.ReactNode
  sx?: SxProps
}

export const MediaWrapper = memo(function MediaWrapper(props: Props) {
  const { children, sx, mode = 'single' } = props
  const { dense } = useContentContext()
  const isMobile = useSM()

  return (
    <html.div
      style={[
        styles.root,
        styles.padding,
        dense && styles.root$dense,
        styles.maxBounds(MAX_BOUNDS[mode].maxWidth, MAX_BOUNDS[mode].maxHeight),
        isMobile && styles.root$mobile,
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
  padding: {
    marginBlock: spacing.margin2,
    marginInline: spacing.margin2,
  },
  maxBounds: (maxWidth: number, maxHeight: number) => ({ maxWidth, maxHeight }),
  minHeight: (minHeight: number) => ({ minHeight }),
})
