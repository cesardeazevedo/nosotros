import { Kind } from 'constants/kinds'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Note } from 'stores/modules/note.store'
import { TokenType } from 'utils/contentParser'
import TextContent from '../Texts/TextContent'
import PostContentWrapper from './PostContentWrapper'
import PostLinkPreview from './PostLinks/PostLinkPreview'
import PostMarkdown from './PostMarkdown'
import PostImage from './PostMedia/PostImage'
import PostVideo from './PostMedia/PostVideo'
import PostNote from './PostNote'

type Props = {
  note: Note
  dense?: boolean
  initialExpanded?: boolean
}

const PostContent = observer(function PostContent(props: Props) {
  const { note, dense = false, initialExpanded = false } = props
  const event = note?.event
  return (
    <>
      <PostContentWrapper note={note} initialExpanded={initialExpanded}>
        {note?.content.parsed.map((token, index) => (
          <React.Fragment key={token.kind + token.content?.toString() + index}>
            {token.kind === TokenType.URL && (
              <PostLinkPreview dense={dense} href={token.href} content={token.content} />
            )}
            {token.kind === TokenType.IMAGE && <PostImage dense={dense} note={note} content={token.content} />}
            {token.kind === TokenType.VIDEO && <PostVideo dense={dense} content={token.content} />}
            {token.kind === TokenType.NOTE && <PostNote dense={dense} noteId={token.content} author={token.author} />}
            {token.kind === TokenType.TEXT && <TextContent token={token} dense={dense} />}
            {token.kind === TokenType.SPACE && <br />}
            {event.kind === Kind.Article && <PostMarkdown token={token} note={note} />}
          </React.Fragment>
        ))}
      </PostContentWrapper>
    </>
  )
})

export default PostContent
