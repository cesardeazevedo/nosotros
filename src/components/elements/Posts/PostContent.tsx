import { observer } from 'mobx-react-lite'
import type Note from 'stores/models/note'
import { Content } from '../Content/Content'
import PostContentWrapper from './PostContentWrapper'

type Props = {
  note: Note
  dense?: boolean
  disableLink?: boolean
  initialExpanded?: boolean
}

const PostContent = observer(function PostContent(props: Props) {
  const { note, dense = false, disableLink = false, initialExpanded = false } = props
  return (
    <PostContentWrapper note={note} initialExpanded={initialExpanded}>
      <Content note={note} dense={dense} disableLink={disableLink} />
    </PostContentWrapper>
  )
})

export default PostContent
