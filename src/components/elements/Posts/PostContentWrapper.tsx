import { Fab } from '@/components/ui/Fab/Fab'
import { palette } from '@/themes/palette.stylex'
import { Kind } from 'constants/kinds'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css, html } from 'react-strict-dom'
import useMeasure from 'react-use-measure'
import type { Note } from 'stores/models/note'
import { BubbleContainer } from '../Content/Layout/Bubble'
import { PostError } from './PostError'
import { ReplyUserHeader } from './PostReplies/PostReplyContent'

type Props = {
  note: Note
  bubble?: boolean
  initialExpanded?: boolean
  children: React.ReactNode
}

const MAX_HEIGHT = 700

export const PostContentWrapper = observer(function PostContentWrapper(props: Props) {
  const { note, bubble = false, initialExpanded = false } = props
  const [ref, bounds] = useMeasure({ debounce: 200 })
  const expanded = initialExpanded || note.contentOpen
  const canExpand = bounds.height >= MAX_HEIGHT && !expanded
  const event = note?.event

  if (![Kind.Text, Kind.Article].includes(event.kind)) {
    const ErrorContainer = bubble ? BubbleContainer : React.Fragment
    return (
      <ErrorContainer>
        {bubble && <ReplyUserHeader note={note} />}
        <PostError note={note} />
      </ErrorContainer>
    )
  }

  return (
    <html.div style={[styles.root, expanded && styles.root$expanded]}>
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
    maxHeight: MAX_HEIGHT,
    overflow: 'hidden',
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
