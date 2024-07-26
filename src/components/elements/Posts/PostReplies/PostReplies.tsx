import { Box, Button, Divider, Typography } from '@mui/material'
import { IconMessageCircle2 } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import type Note from 'stores/models/note'
import PostRepliesLoading from './PostRepliesLoading'
import { PostRepliesTree } from './PostReply'
import PostReplyForm from './PostReplyForm'

type Props = {
  note: Note
  onReplyClick: () => void
}

const PostReplies = observer(function PostReplies(props: Props) {
  const { note, onReplyClick } = props

  const replies = note.repliesOpen === null ? note.repliesPreview : note.repliesSorted

  if (note.repliesOpen === false || (replies.length === 0 && note.repliesStatus === 'IDLE')) {
    return
  }

  return (
    <>
      <Divider />
      <PostReplyForm />
      <Box sx={{ ml: -3, mr: 2 }}>
        <PostRepliesTree replies={replies} repliesOpen={note.repliesOpen} level={1} />
      </Box>
      {note.repliesStatus === 'LOADED' && replies.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}>
          <IconMessageCircle2 size={50} strokeWidth='1.0' />
          <Typography variant='subtitle1' sx={{ fontWeight: 400 }}>
            No Replies yet
          </Typography>
        </Box>
      )}
      {note.repliesStatus === 'IDLE' && (
        <Box sx={{ p: 2, py: 1 }}>
          <Button
            color='info'
            onClick={onReplyClick}
            sx={{ fontWeight: 600, cursor: 'pointer', color: 'text.primary' }}>
            See more replies
          </Button>
        </Box>
      )}
      {note.repliesStatus === 'LOADING' && <PostRepliesLoading contentHeight={50} />}
    </>
  )
})

export default PostReplies
