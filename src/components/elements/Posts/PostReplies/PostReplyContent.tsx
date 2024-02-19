import { Content } from 'components/elements/Content/Content'
import { observer } from 'mobx-react-lite'
import type { Note } from 'stores/modules/note.store'
import PostContentWrapper from '../PostContentWrapper'

type Props = {
  note: Note
  dense?: boolean
  initialExpanded?: boolean
}

const PostReplyContent = observer(function PostReplyContent(props: Props) {
  const { note, dense = true } = props
  return (
    <PostContentWrapper bubble note={note}>
      <Content bubble note={note} dense={dense} />
    </PostContentWrapper>
  )
})

export default PostReplyContent
