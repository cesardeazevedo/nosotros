import { Kind } from '@/constants/kinds'
import { getMimeType } from '@/hooks/parsers/parseImeta'
import type { NoteState } from '@/hooks/state/useNote'
import { memo, useMemo } from 'react'
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
  const imeta = note.event.metadata?.imeta

  const media = useMemo(() => {
    if ((note.event.kind === Kind.Media || note.event.kind === Kind.Video || note.event.kind === Kind.ShortVideo) && imeta) {
      return Object.values(imeta || {})
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
        .filter((x): x is { index: number; type: 'image' | 'video'; src: string } => !!x?.type)
    }
    return []
  }, [note.event, imeta])

  return (
    <PostContentWrapper
      expanded={note.state.contentOpen}
      onExpand={() => note.actions.toggleContent(true)}
      initialExpanded={initialExpanded}>
      {note.metadata?.isRoot === false && <ReplyHeader />}
      {note.event.kind === Kind.Media || note.event.kind === Kind.Video || note.event.kind === Kind.ShortVideo ? (
        <>
          <MediaGroup media={media} />
          <Content renderMedia={false} />
        </>
      ) : (
        <Content />
      )}
    </PostContentWrapper>
  )
})
