import { Fab } from '@/components/ui/Fab/Fab'
import type { NoteState } from '@/hooks/state/useNote'
import { useIsDarkTheme } from '@/hooks/useTheme'
import { palette } from '@/themes/palette.stylex'
import React, { memo, useEffect, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import useMeasure from 'react-use-measure'

export type Props = {
  size?: 'xs' | 'sm' | 'md'
  initialExpanded?: boolean
  children: React.ReactNode
  note: NoteState
}

const sizes = {
  xs: 200,
  sm: 400,
  md: 700,
}

export const PostContentWrapper = memo(function PostContentWrapper(props: Props) {
  const { note, initialExpanded = false, size = 'md' } = props
  const [ref, bounds] = useMeasure({ debounce: 100 })
  const expanded = initialExpanded || note.state.contentOpen
  const maxHeight = sizes[size]
  const canExpand = bounds.height >= maxHeight && !expanded
  const isDarkTheme = useIsDarkTheme()

  const root = useRef<HTMLDivElement | null>(null)

  // Some very weird issue with this after introducing YARL component,
  // after closing the YARL dialog, the root div is being suddenly upwards
  // clipping the content, this needs further investigation
  useEffect(() => {
    const element = root.current
    if (element) {
      const onScroll = () => {
        element.scrollTop = 0
      }
      element.addEventListener('scroll', onScroll)
      return () => element.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <html.div style={[styles.root, styles[size], expanded && styles.root$expanded]} ref={root}>
      <html.div ref={ref}>{props.children}</html.div>
      {canExpand && (
        <html.div style={styles.container}>
          <html.div style={[styles.shadow, isDarkTheme && styles.shadow$dark]} />
          <Fab
            variant='primary'
            label='View More'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              note.actions.toggleContent(true)
            }}
          />
        </html.div>
      )}
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  xs: {
    maxHeight: sizes.xs,
  },
  sm: {
    maxHeight: sizes.sm,
  },
  md: {
    maxHeight: sizes.md,
  },
  root$expanded: {
    maxHeight: 'inherit',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    paddingBottom: 40,
    transition: 'opacity 0.14s ease',
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100,
    left: 0,
    right: 0,
    opacity: 0.24,
    pointerEvents: 'none',
    background: `linear-gradient(0deg, ${palette.inverseSurface}, transparent)`,
  },
  shadow$dark: {
    width: 'calc(100% - 2px)',
    opacity: 0.86,
    left: 1,
    right: 1,
    background: `linear-gradient(0deg, rgba(0, 0, 0, 1), 62px, transparent)`,
  },
})
