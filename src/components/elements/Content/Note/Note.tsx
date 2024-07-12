import { Box, Paper, Skeleton } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import LinkNEvent from 'components/elements/Links/LinkNEvent'
import PostActions from 'components/elements/Posts/PostActions/PostActions'
import PostContent from 'components/elements/Posts/PostContent'
import UserHeader from 'components/elements/User/UserHeader'
import { observer } from 'mobx-react-lite'
import { noteStore } from 'stores/nostr/notes.store'

type Props = {
  noteId: string
  author: string | undefined
  dense?: boolean
}

const Note = observer(function PostNote(props: Props) {
  const { dense } = props
  const note = noteStore.get(props.noteId)
  return (
    <>
      {!note && (
        <Box sx={{ mt: 1, px: dense ? 0 : 2 }}>
          <Skeleton variant='rectangular' animation='wave' sx={{ width: '100%', height: 100, borderRadius: 2 }} />
        </Box>
      )}
      {note && (
        <Paper variant='outlined' sx={{ borderRadius: 2, mt: 1, mx: dense ? 0 : 2, pb: 2, background: 'transparent' }}>
          <LinkNEvent note={note} underline='none' sx={{ cursor: 'pointer', fontWeight: 'normal' }}>
            <Row sx={{ px: 2, pt: 1 }}>
              <UserHeader dense note={note} />
            </Row>
            <PostContent initialExpanded note={note} />
            <Box sx={{ mt: 1, ml: 2 }}>
              <PostActions dense note={note} />
            </Box>
          </LinkNEvent>
        </Paper>
      )}
    </>
  )
})

export default Note
