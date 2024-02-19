import { Box, Typography } from '@mui/material'
import { IconMessageCircle2 } from '@tabler/icons-react'
import { useStore } from 'hooks/useStore'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import PostRepliesLoading from './PostRepliesLoading'
import { PostRepliesTree } from './PostReply'
import PostReplyForm from './PostReplyForm'

type Props = {
  noteId?: string
}

const PostRepliesDialog = observer(function PostRepliesDialog(props: Props) {
  const { noteId } = props
  const store = useStore()
  // Avoid underfined noteId when closing the dialog, disappearing the content
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const id = useMemo(() => noteId, [])
  const note = store.notes.getNoteById(id)
  const replies = note?.repliesSorted || []

  useEffect(() => {
    note?.subscribeReplies()
  }, [note])

  return (
    <>
      <Box sx={{ position: 'relative', pt: 2, pb: 1, flex: 1, overflowY: 'auto' }}>
        <Box
          sx={{
            height: note?.repliesStatus === 'LOADED' && replies.length > 0 ? '100%' : 'auto',
            ml: -3,
            pr: 2,
            width: '100%',
            overflowY: 'visible',
            position: 'relative',
            '> div': {
              overflowX: 'hidden',
            },
          }}>
          <PostRepliesTree replies={replies} repliesOpen level={1} />
        </Box>
        {note && note.repliesStatus === 'LOADING' && <PostRepliesLoading contentHeight={50} />}
        {note?.repliesStatus === 'LOADED' && replies.length === 0 && (
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
