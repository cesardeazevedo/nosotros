import { Box, Typography } from '@mui/material'
import DeckColumnHeader from 'components/elements/Deck/DeckColumnHeader'
import Post from 'components/elements/Posts/Post'
import { useModuleSubscription } from 'hooks/useFeedSubscription'
import { observer } from 'mobx-react-lite'
import type { NoteModule } from 'stores/modules/note.module'

type Props = {
  module: NoteModule
}

const PostColumn = observer(function PostColumn(props: Props) {
  const { module } = props
  useModuleSubscription(module)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', p: 0 }}>
      <DeckColumnHeader id={module.id} name='Post'>
        <Typography variant='h6' fontWeight='bold' sx={{ ml: 1 }}>
          Post
        </Typography>
      </DeckColumnHeader>
      {module.note && <Post note={module.note} />}
    </Box>
  )
})

export default PostColumn
