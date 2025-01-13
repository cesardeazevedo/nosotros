import { observer } from 'mobx-react-lite'
import type { Note } from '@/stores/notes/note'
import { Content } from '../Content/Content'
import { PostContentWrapper } from './PostContentWrapper'
import { PostReplyingHeader } from './PostReplyingHeader'

type Props = {
  note: Note
  dense?: boolean
  disableLink?: boolean
  initialExpanded?: boolean
}

export const PostContent = observer(function PostContent(props: Props) {
  const { note, dense = false, disableLink = false, initialExpanded = false } = props
  return (
    <PostContentWrapper note={note} initialExpanded={initialExpanded}>
      {note.metadata.isRoot === false && <PostReplyingHeader disableLink={disableLink} note={note} />}
      <Content note={note} dense={dense} disableLink={disableLink} />
    </PostContentWrapper>
  )
})
