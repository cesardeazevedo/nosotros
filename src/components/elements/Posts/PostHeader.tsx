import { styled } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import { Note } from 'stores/modules/note.store'
import UserHeader from '../User/UserHeader'
import PostOptions from './PostOptions'

type Props = {
  note: Note
}

const Container = styled(Row)({
  justifyContent: 'space-between',
  padding: 16,
})

function PostHeader(props: Props) {
  const { note } = props
  return (
    <Container>
      <UserHeader note={note} />
      <PostOptions note={note} />
    </Container>
  )
}

export default PostHeader
