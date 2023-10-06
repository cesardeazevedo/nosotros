import { Row } from 'components/elements/Layouts/Flex'
import { PostButtonReply, PostButtonRepost, PostButtonZap } from 'components/elements/Posts/PostActions'

import { Observer } from 'mobx-react-lite'
import { PostStore } from 'stores/modules/post.store'
import PostReactions from './PostReactions'
import PostButtonRelays from './PostRelays'

type Props = {
  post: PostStore
  dense?: boolean
  onReplyClick?: () => void
  renderRelays?: boolean
  renderRepost?: boolean
  renderReply?: boolean
  renderZap?: boolean
}

function PostActions(props: Props) {
  const { post, renderRepost = true, renderReply = true, renderZap = true, renderRelays = true, dense = false } = props

  const { event: data } = post
  // const isMobile = useMobile()

  return (
    <>
      <Row sx={{ px: dense ? 0 : 2, py: dense ? 0.6 : 2, justifyContent: 'space-between' }}>
        <Row
          sx={{
            flex: 1,
            justifyContent: dense ? 'flex-start' : 'space-between',
            '> *': { ml: 1, mr: dense ? 0.5 : 1 },
          }}>
          <PostReactions noteId={data.id} dense={dense} />
          {renderRepost && <PostButtonRepost dense={dense} />}
          <Observer>
            {() => (
              <>
                {renderReply && (
                  <PostButtonReply
                    dense={dense}
                    value={post.totalReplies}
                    onClick={props.onReplyClick}
                    // onClick={() => (isMobile ? post.openRepliesDialog() : post.toggleReplies())}
                  />
                )}
              </>
            )}
          </Observer>
          {renderZap && <PostButtonZap dense={dense} />}
          {renderRelays && <PostButtonRelays dense={dense} eventId={data.id} />}
        </Row>
      </Row>
    </>
  )
}

export default PostActions
