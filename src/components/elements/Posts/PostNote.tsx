import { Box, Paper, Skeleton } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import { observer } from 'mobx-react-lite'
import { useStore } from 'stores'
import UserDisplayName from '../User/UserHeader'
import PostContent from './PostContent'

type Props = {
  noteId: string
  author: string | undefined
}

const PostNote = observer(function PostNote(props: Props) {
  const store = useStore()
  const event = store.notes.getNoteById(props.noteId)
  return (
    <>
      {!event && (
        <Box sx={{ mt: 1, px: 2 }}>
          <Skeleton variant='rectangular' animation='wave' sx={{ width: '100%', height: 100, borderRadius: 1 }} />
        </Box>
      )}
      {event && (
        <Paper variant='outlined' sx={{ mt: 1, mx: 2, pb: 2, background: 'transparent' }}>
          <Row sx={{ p: 2 }}>
            <UserDisplayName dense event={event} />
          </Row>
          <PostContent initialExpanded event={event} />
        </Paper>
      )}
    </>
  )
})

export default PostNote
