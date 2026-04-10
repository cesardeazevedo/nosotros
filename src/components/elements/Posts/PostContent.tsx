import { useNoteContext } from '@/components/providers/NoteProvider'
import { Kind } from '@/constants/kinds'
import { getMimeType } from '@/hooks/parsers/parseImeta'
import { memo, useMemo } from 'react'
import { Content } from '../Content/Content'
import { MediaGroup } from '../Content/Layout/MediaGroup'
import { ReplyHeader } from '../Replies/ReplyHeader'

export const PostContent = memo(function PostContent() {
  const { note } = useNoteContext()
  const imeta = note.event.metadata?.imeta

  const media = useMemo(() => {
    if (
      (note.event.kind === Kind.Media || note.event.kind === Kind.Video || note.event.kind === Kind.ShortVideo) &&
      imeta
    ) {
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
    <>
      {note.metadata?.isRoot === false && <ReplyHeader />}
      {note.event.kind === Kind.Media || note.event.kind === Kind.Video || note.event.kind === Kind.ShortVideo ? (
        <>
          <MediaGroup media={media} />
          <Content renderMedia={false} />
        </>
      ) : (
        <Content />
      )}
    </>
  )
})
