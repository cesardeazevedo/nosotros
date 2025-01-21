import type { Note } from '@/stores/notes/note'
import { observer } from 'mobx-react-lite'
import { Content } from '../Content/Content'
import { PostContentWrapper } from './PostContentWrapper'
import { PostReplyingHeader } from './PostReplyingHeader'

type Props = {
  note: Note
  initialExpanded?: boolean
}

export const PostContent = observer(function PostContent(props: Props) {
  const { note, initialExpanded = false } = props
  return (
    <PostContentWrapper note={note} initialExpanded={initialExpanded}>
      {note.metadata.isRoot === false && <PostReplyingHeader note={note} />}
      <Content note={note} />
    </PostContentWrapper>
  )
})
