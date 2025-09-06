import { Kind } from '@/constants/kinds'
import type { NoteState } from '@/hooks/state/useNote'
import { memo } from 'react'
import { Content } from '../Content/Content'
import { MediaList } from '../Media/MediaList'
import { ReplyHeader } from '../Replies/ReplyHeader'
import { PostContentWrapper } from './PostContentWrapper'

type Props = {
  note: NoteState
  initialExpanded?: boolean
}

export const PostContent = memo(function PostContent(props: Props) {
  const { note, initialExpanded = false } = props
  return (
    <PostContentWrapper note={note} initialExpanded={initialExpanded}>
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
