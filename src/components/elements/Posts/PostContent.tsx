import { useNoteContext } from '@/components/providers/NoteProvider'
import { Kind } from '@/constants/kinds'
import { memo } from 'react'
import { Content } from '../Content/Content'
import { MediaList } from '../Media/MediaList'
import { ReplyHeader } from '../Replies/ReplyHeader'
import { PostContentWrapper } from './PostContentWrapper'

type Props = {
  initialExpanded?: boolean
}

export const PostContent = memo(function PostContent(props: Props) {
  const { initialExpanded = false } = props
  const { note } = useNoteContext()
  return (
    <PostContentWrapper initialExpanded={initialExpanded}>
      {note.metadata?.isRoot === false && <ReplyHeader />}
      {note.event.kind === Kind.Media ? (
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
