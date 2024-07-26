import { styled } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import type Note from 'stores/models/note'
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
