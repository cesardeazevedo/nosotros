import { Row } from 'components/elements/Layouts/Flex'
import TextContent from 'components/elements/Texts/TextContent'
import { UserHeaderDate } from 'components/elements/User/UserHeader'
import UserName from 'components/elements/User/UserName'
import { Kind } from 'constants/kinds'
import React from 'react'
import { useStore } from 'stores'
import { Note } from 'stores/modules/note.store'
import { TokenType } from 'utils/contentParser'
import PostContentWrapper from '../PostContentWrapper'
import PostLinkPreview from '../PostLinks/PostLinkPreview'
import PostMarkdown from '../PostMarkdown'
import PostImage from '../PostMedia/PostImage'
import PostVideo from '../PostMedia/PostVideo'
import PostNote from '../PostNote'
import Bubble from './PostReplyBubble'

type Props = {
  note: Note
  dense?: boolean
  initialExpanded?: boolean
}

function PostReplyContent(props: Props) {
  const { note, dense = true } = props
  const store = useStore()
  const user = store.users.getUserById(note.event?.pubkey)
  const firstToken = note?.content.parsed[0]
  const isFirstText = firstToken?.kind === TokenType.TEXT
  return (
    <PostContentWrapper bubble note={note}>
      {isFirstText && (
        <Bubble>
          <Row>
            <UserName user={user} />
            <UserHeaderDate note={note} />
          </Row>
          {firstToken && <TextContent token={firstToken} dense />}
        </Bubble>
      )}
      {!isFirstText && (
        <Row>
          <UserName user={user} />
          <UserHeaderDate note={note} />
        </Row>
      )}
      {note?.content.parsed.slice(isFirstText ? 1 : 0).map((token, index) => (
        <React.Fragment key={token.kind + token.content?.toString() + index}>
          {token.kind === TokenType.URL && <PostLinkPreview dense={dense} href={token.href} content={token.content} />}
          {token.kind === TokenType.IMAGE && <PostImage dense={dense} note={note} content={token.content} />}
          {token.kind === TokenType.VIDEO && <PostVideo dense={dense} content={token.content} />}
          {token.kind === TokenType.NOTE && <PostNote dense={dense} noteId={token.content} author={token.author} />}
          {token.kind === TokenType.TEXT && <TextContent bubble token={token} dense={dense} />}
          {note.event.kind === Kind.Article && <PostMarkdown token={token} note={note} />}
        </React.Fragment>
      ))}
    </PostContentWrapper>
  )
}

export default PostReplyContent
