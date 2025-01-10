import { Fab } from '@/components/ui/Fab/Fab'
import type { Note } from '@/stores/notes/note'
import { palette } from '@/themes/palette.stylex'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css, html } from 'react-strict-dom'
import useMeasure from 'react-use-measure'

export type Props = {
  note: Note
  size?: 'xs' | 'sm' | 'md'
  bubble?: boolean
  initialExpanded?: boolean
  children: React.ReactNode
}

const sizes = {
  xs: 200,
  sm: 400,
  md: 700,
}

export const PostContentWrapper = observer(function PostContentWrapper(props: Props) {
  const { note, initialExpanded = false, size = 'md' } = props
  const [ref, bounds] = useMeasure({ debounce: 200 })
  const expanded = initialExpanded || note.contentOpen
  const maxHeight = sizes[size]
  const canExpand = bounds.height >= maxHeight && !expanded

  return (
    <html.div style={[styles.root, styles[size], expanded && styles.root$expanded]}>
      <html.div ref={ref} style={styles.bounds}>
        {props.children}
      </html.div>
      {canExpand && (
        <html.div style={styles.container}>
          <html.div style={styles.shadow} />
          <Fab variant='primary' label='View More' onClick={() => note.toggleContent(true)} />
        </html.div>
      )}
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    overflow: 'hidden',
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
  bounds: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    textAlign: 'center',
    paddingBottom: 40,
    transition: 'opacity 0.14s ease',
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    zIndex: 1000,
    width: '100%',
    height: 100,
    opacity: 0.2,
    pointerEvents: 'none',
    background: `linear-gradient(0deg, ${palette.inverseSurface}, transparent)`,
  },
})
