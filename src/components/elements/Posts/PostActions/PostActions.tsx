import { styled } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import { PostButtonReply, PostButtonRepost, PostButtonZap } from 'components/elements/Posts/PostActions'
import { Observer } from 'mobx-react-lite'
import type Note from 'stores/models/note'
import PostButtonReact from './PostButtonReact'
import PostButtonRelays from './PostRelays'

type Props = {
  note: Note
  dense?: boolean
  onReplyClick?: () => void
  renderRelays?: boolean
  renderRepost?: boolean
  renderReply?: boolean
  renderZap?: boolean
}

const shouldForwardProp = (prop: string) => prop !== 'dense'

const Container = styled(Row, { shouldForwardProp })<{ dense: boolean }>(({ dense }) => ({
  padding: dense ? 0 : 16,
  justifyContent: dense ? 'flex-start' : 'space-between',
}))

function PostActions(props: Props) {
  const { note, renderRepost = true, renderReply = true, renderZap = true, renderRelays = true, dense = false } = props

  return (
    <Container dense={dense}>
      <PostButtonReact note={note} dense={dense} />
      {renderRepost && <PostButtonRepost dense={dense} />}
      <Observer>
        {() => (
          <>{renderReply && <PostButtonReply dense={dense} value={note.totalReplies} onClick={props.onReplyClick} />}</>
        )}
      </Observer>
      {renderZap && <PostButtonZap dense={dense} />}
      {renderRelays && <PostButtonRelays dense={dense} note={note} />}
    </Container>
  )
}

export default PostActions
