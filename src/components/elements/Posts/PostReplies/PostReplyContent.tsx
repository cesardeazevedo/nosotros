import { Content } from 'components/elements/Content/Content'
import { observer } from 'mobx-react-lite'
import type Note from 'stores/models/note'
import PostContentWrapper from '../PostContentWrapper'

type Props = {
  note: Note
}

const PostReplyContent = observer(function PostReplyContent(props: Props) {
  const { note } = props
  return (
    <PostContentWrapper bubble note={note}>
      <Content dense bubble note={note} />
    </PostContentWrapper>
  )
})

export default PostReplyContent
