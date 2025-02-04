import { useNoteContext } from '@/components/providers/NoteProvider'
import { Kind } from '@/constants/kinds'
import { observer } from 'mobx-react-lite'
import { Content } from '../Content/Content'
import { MediaList } from '../Media/MediaList'
import { PostContentWrapper } from './PostContentWrapper'
import { PostReplyingHeader } from './PostReplyingHeader'

type Props = {
  initialExpanded?: boolean
}

export const PostContent = observer(function PostContent(props: Props) {
  const { initialExpanded = false } = props
  const { note } = useNoteContext()
  return (
    <PostContentWrapper initialExpanded={initialExpanded}>
      {note.metadata.isRoot === false && <PostReplyingHeader />}
      {note.event.event.kind === Kind.Media ? (
        <>
          <MediaList />
          <Content renderMedia={false} />
        </>
      ) : (
        <Content />
      )}
    </PostContentWrapper>
  )
})
