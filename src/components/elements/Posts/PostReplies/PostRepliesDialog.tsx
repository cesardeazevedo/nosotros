import { Box, Typography } from '@mui/material'
import { IconMessageCircle2 } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { PostStore } from 'stores/modules/post.store'
import PostRepliesLoading from './PostRepliesLoading'
import { PostRepliesTree } from './PostReply'
import PostReplyForm from './PostReplyForm'

type Props = {
  post: PostStore | null
}

const PostRepliesDialog = observer(function PostRepliesDialog(props: Props) {
  const { post } = props
  const replies = post ? Object.values(Object.fromEntries(post.repliesTree)) : []
  return (
    <>
      <Box sx={{ position: 'relative', pt: 2, pb: 1, flex: 1, overflowY: 'auto' }}>
        <Box
          sx={{
            height: post?.repliesStatus === 'LOADED' && replies.length > 0 ? '100%' : 'auto',
            ml: -3,
            pr: 2,
            width: '100%',
            overflowY: 'visible',
            position: 'relative',
            '>div': {
              overflowX: 'hidden',
            },
          }}>
          <PostRepliesTree replies={replies} level={1} />
        </Box>
        {post && post.repliesStatus === 'LOADING' && <PostRepliesLoading contentHeight={50} />}
        {post?.repliesStatus === 'LOADED' && replies.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}>
            <IconMessageCircle2 size={50} strokeWidth='1.0' />
            <Typography variant='subtitle1' sx={{ fontWeight: 400, mt: 1 }}>
              No Replies yet
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ pb: 4 }}>
        <PostReplyForm />
      </Box>
    </>
  )
})

export default PostRepliesDialog
