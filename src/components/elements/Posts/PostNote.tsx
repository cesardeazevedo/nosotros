import { Box, Paper, Skeleton } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import { observer } from 'mobx-react-lite'
import { useStore } from 'stores'
import LinkNEvent from '../Links/LinkNEvent'
import UserHeader from '../User/UserHeader'
import PostContent from './PostContent'

type Props = {
  noteId: string
  author: string | undefined
  dense?: boolean
}

const PostNote = observer(function PostNote(props: Props) {
  const { noteId, dense } = props
  const store = useStore()
  const note = store.notes.getNoteById(noteId)
  return (
    <>
      {!note && (
        <Box sx={{ mt: 1, px: 2 }}>
          <Skeleton variant='rectangular' animation='wave' sx={{ width: '100%', height: 100, borderRadius: 2 }} />
        </Box>
      )}
      {note && (
        <Paper variant='outlined' sx={{ borderRadius: 2, mt: 1, mx: dense ? 0 : 2, pb: 2, background: 'transparent' }}>
          <Row sx={{ px: 2, pt: 1 }}>
            <UserHeader dense note={note} />
          </Row>
          {note && (
            <LinkNEvent note={note} underline='none'>
              <PostContent initialExpanded note={note} />
            </LinkNEvent>
          )}
        </Paper>
      )}
    </>
  )
})

export default PostNote
