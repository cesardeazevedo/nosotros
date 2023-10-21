import { Box, Button, Divider } from '@mui/material'
import { useMobile } from 'hooks/useMobile'
import { Observer } from 'mobx-react-lite'
import { PostStore } from 'stores/modules/post.store'
import PostRepliesLoading from './PostRepliesLoading'
import { PostRepliesTree } from './PostReply'
import PostReplyForm from './PostReplyForm'

type Props = {
  post: PostStore
}

function PostReplies(props: Props) {
  const { post } = props
  const isMobile = useMobile()
  return (
    <>
      <Divider />
      <PostReplyForm />
      <Observer>
        {() => (
          <>
            <Box sx={{ ml: -3, mr: 2 }}>
              <PostRepliesTree replies={Object.values(Object.fromEntries(post.repliesTree))} level={1} />
            </Box>
            {post.repliesStatus === 'IDLE' && (
              <Box sx={{ p: 2, py: 2 }}>
                <Button
                  color='info'
                  // variant='outlined'
                  onClick={isMobile ? post.openRepliesDialog : post.toggleReplies}
                  sx={{ fontWeight: 600, cursor: 'pointer', color: 'text.primary' }}>
                  See more replies
                </Button>
              </Box>
            )}
            {post.repliesStatus === 'LOADING' && <PostRepliesLoading contentHeight={50} />}
          </>
        )}
      </Observer>
    </>
  )
}

export default PostReplies
