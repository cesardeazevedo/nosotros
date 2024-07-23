import { Fab, styled, type Theme } from '@mui/material'
import { Kind } from 'constants/kinds'
import React, { useState } from 'react'
import useMeasure from 'react-use-measure'
import type Note from 'stores/models/note'
import { BubbleContainer } from '../Content/Layout/Bubble'
import PostError from './PostError'

type Props = {
  note: Note
  bubble?: boolean
  initialExpanded?: boolean
  children: React.ReactNode
}

const Container = styled('div', { shouldForwardProp: (prop: string) => prop !== 'expanded' })<{ expanded: boolean }>(
  ({ expanded }) => ({
    position: 'relative',
    maxHeight: expanded ? 'inherit' : MAX_HEIGHT,
    overflow: 'hidden',
  }),
)

const MAX_HEIGHT = 700

const ExpandContainer = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  textAlign: 'center',
  paddingBottom: 40,
  transition: 'opacity 0.14s ease',
})

const ShadowIndicator = styled('div')(({ theme }: { theme: Theme }) => ({
  position: 'absolute',
  bottom: 0,
  zIndex: 1000,
  width: '100%',
  height: 100,
  background:
    theme.palette.mode === 'light'
      ? 'linear-gradient(0deg, rgba(0, 0, 0, 0.5), transparent)'
      : 'linear-gradient(0deg, rgba(255, 255, 255, 0.2), transparent)',
}))

function PostContentWrapper(props: Props) {
  const { note, bubble = false, initialExpanded = false } = props
  const [ref, bounds] = useMeasure({ debounce: 200 })
  const [expanded, setExpanded] = useState(initialExpanded)
  const canExpand = bounds.height >= MAX_HEIGHT && !expanded
  const event = note?.event

  if (![Kind.Text, Kind.Article].includes(event.kind)) {
    const ErrorContainer = bubble ? BubbleContainer : React.Fragment
    return (
      <ErrorContainer>
        <PostError kind={event.kind} />
      </ErrorContainer>
    )
  }

  return (
    <Container expanded={expanded}>
      <div ref={ref} className='bounds' style={{ display: 'flex', flexDirection: 'column' }}>
        {props.children}
      </div>
      {canExpand && (
        <ExpandContainer>
          <ShadowIndicator />
          <Fab
            size='large'
            variant='extended'
            color='info'
            onClick={() => {
              setExpanded(true)
            }}>
            View More
          </Fab>
        </ExpandContainer>
      )}
    </Container>
  )
}

export default PostContentWrapper
