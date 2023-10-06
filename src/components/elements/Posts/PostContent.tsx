import { Button, Paper } from '@mui/material'
import { styled } from '@mui/material/styles'
// eslint-disable-next-line import/order
import { Kind } from 'constants/kinds'
import { observer } from 'mobx-react-lite'
import { Event } from 'nostr-tools'
import React, { useState } from 'react'
import useMeasure from 'react-use-measure'
import { useStore } from 'stores'
import { TokenType } from 'utils/contentParser'
import TextContent from '../Texts/TextContent'
import PostLinkPreview from './PostLinks/PostLinkPreview'
import PostMarkdown from './PostMarkdown'
import PostImage from './PostMedia/PostImage'
import PostVideo from './PostMedia/PostVideo'
import PostNote from './PostNote'

type Props = {
  event: Event
  dense?: boolean
  initialExpanded?: boolean
}

const MAX_HEIGHT = 700

const Container = styled('div', { shouldForwardProp: (prop: string) => prop !== 'expanded' })<{ expanded: boolean }>(
  ({ expanded }) => ({
    position: 'relative',
    maxHeight: expanded ? 'inherit' : MAX_HEIGHT,
    overflow: 'hidden',
  }),
)

const ExpandContainer = styled(Paper)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  borderRadius: 0,
  textAlign: 'center',
  padding: 8,
})

const ShadowIndicator = styled('div')({
  position: 'absolute',
  bottom: 0,
  zIndex: 1000,
  width: '100%',
  height: 100,
  background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5), transparent)',
})

const PostContent = observer(function PostContent(props: Props) {
  const { event, dense = false, initialExpanded = false } = props
  const [ref, bounds] = useMeasure({ debounce: 400 })
  const [expanded, setExpanded] = useState(initialExpanded)
  const store = useStore()
  const content = store.notes.getParsedContentById(event.id)
  const canExpand = bounds.height >= MAX_HEIGHT && !expanded
  return (
    <>
      <Container expanded={expanded}>
        <div ref={ref} className='bounds'>
          {content?.content?.map((token, index) => (
            <React.Fragment key={token.kind + token.content.toString() + index}>
              {token.kind === TokenType.URL && (
                <PostLinkPreview dense={dense} href={token.href} content={token.content} />
              )}
              {token.kind === TokenType.IMAGE && <PostImage dense={dense} content={token.content} />}
              {token.kind === TokenType.VIDEO && <PostVideo dense={dense} content={token.content} />}
              {token.kind === TokenType.NOTE && <PostNote noteId={token.content} author={token.author} />}
              {token.kind === TokenType.TEXT && <TextContent token={token} dense={dense} />}
              {event.kind === Kind.Article && <PostMarkdown token={token} />}
            </React.Fragment>
          ))}
        </div>
        {canExpand && <ShadowIndicator />}
        {canExpand && (
          <ExpandContainer>
            <Button onClick={() => setExpanded(true)}>View More</Button>
          </ExpandContainer>
        )}
      </Container>
    </>
  )
})

export default PostContent
