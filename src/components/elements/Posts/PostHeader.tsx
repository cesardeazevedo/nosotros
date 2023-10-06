import { Box } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import { PostStore } from 'stores/modules/post.store'
import UserHeader from '../User/UserHeader'
import PostOptions from './PostOptions'

type Props = {
  post: PostStore
}

function PostHeader(props: Props) {
  const { post } = props
  return (
    <Row sx={{ p: 2, justifyContent: 'space-between' }}>
      <Box sx={{ flex: 1 }}>
        <UserHeader event={post.event} />
      </Box>
      <PostOptions post={post} />
    </Row>
  )
}

export default PostHeader
