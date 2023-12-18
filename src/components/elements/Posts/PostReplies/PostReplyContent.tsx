import { Row } from 'components/elements/Layouts/Flex'
import TextContent from 'components/elements/Texts/TextContent'
import { UserHeaderDate } from 'components/elements/User/UserHeader'
import UserName from 'components/elements/User/UserName'
import { Kind } from 'constants/kinds'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { useStore } from 'stores'
import { Note } from 'stores/modules/note.store'
import { User } from 'stores/modules/user.store'
import { Token, TokenType } from 'utils/contentParser'
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

const ReplyUserHeader = (props: { note: Note; user?: User }) => (
  <Row>
    <UserName user={props.user} />
    <UserHeaderDate note={props.note} />
  </Row>
)

const PostReplyContent = observer(function PostReplyContent(props: Props) {
  const { note, dense = true } = props
  const store = useStore()
  const user = store.users.getUserById(note.event?.pubkey)
  const parsed = useMemo(() => note.content.groupBubbles(note.content.parsed), [note])
  // We render the username inside the first bubble
  const isFirstBubble = parsed[0]?.kind === TokenType.BUBBLE
  return (
    <PostContentWrapper bubble note={note}>
      {!isFirstBubble && <ReplyUserHeader user={user} note={note} />}
      {parsed.map((token, index) => (
        <React.Fragment key={token.kind + token.content?.toString() + index}>
          {token.kind === TokenType.URL && <PostLinkPreview dense={dense} href={token.href} content={token.content} />}
          {token.kind === TokenType.IMAGE && <PostImage dense={dense} note={note} content={token.content} />}
          {token.kind === TokenType.VIDEO && <PostVideo dense={dense} content={token.content} />}
          {token.kind === TokenType.NOTE && <PostNote dense={dense} noteId={token.content} author={token.author} />}
          {token.kind === TokenType.BUBBLE && (
            <Bubble>
              {index === 0 && <ReplyUserHeader user={user} note={note} />}
              {token.content.map((text, index) => (
                <TextContent key={text.toString() + index} token={text as Token} dense={dense} />
              ))}
            </Bubble>
          )}
          {note.event.kind === Kind.Article && <PostMarkdown token={token} note={note} />}
        </React.Fragment>
      ))}
    </PostContentWrapper>
  )
})

export default PostReplyContent
