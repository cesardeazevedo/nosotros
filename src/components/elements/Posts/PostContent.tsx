import { Kind } from '@/constants/kinds'
import { getMimeType } from '@/hooks/parsers/parseImeta'
import type { NoteState } from '@/hooks/state/useNote'
import { memo } from 'react'
import { Content } from '../Content/Content'
import { MediaGroup } from '../Content/Layout/MediaGroup'
import { ReplyHeader } from '../Replies/ReplyHeader'
import { PostContentWrapper } from './PostContentWrapper'

type Props = {
  note: NoteState
  initialExpanded?: boolean
}

export const PostContent = memo(function PostContent(props: Props) {
  const { note, initialExpanded = false } = props
  const imeta = note.event.metadata?.imeta || {}
  return (
    <PostContentWrapper note={note} initialExpanded={initialExpanded}>
      {note.metadata?.isRoot === false && <ReplyHeader />}
      {note.event.kind === Kind.Media ? (
        <>
          <MediaGroup
            media={Object.values(imeta || {})
              .map((x, index) => {
                if (!x.url) {
                  return undefined
                }
                return {
                  index,
                  type: getMimeType(x.url, imeta),
                  src: x.url,
                }
              })
              .filter((x) => !!x)}
          />
          <Content renderMedia={false} />
        </>
      ) : (
        <Content />
      )}
    </PostContentWrapper>
  )
})
