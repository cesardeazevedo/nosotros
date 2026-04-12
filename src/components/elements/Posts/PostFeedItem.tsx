import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNoteState } from '@/hooks/state/useNote'
import { memo } from 'react'
import { PostActions } from './PostActions/PostActions'
import { PostContent } from './PostContent'
import { PostContentHidden } from './PostContentHidden'
import { PostContentWrapper } from './PostContentWrapper'
import { PostHeader } from './PostHeader'

type Props = {
  event: NostrEventDB
}

export const PostFeedItem = memo(function PostFeedItem(props: Props) {
  const { event } = props
  const note = useNoteState(event, { repliesOpen: false, forceSync: false, contentOpen: false })

  return (
    <PostHeader event={event}>
      <PostContentHidden event={event}>
        <PostContentWrapper expanded={note.state.contentOpen} onExpand={() => note.actions.toggleContent(true)}>
          <PostContent />
        </PostContentWrapper>
        <PostActions />
      </PostContentHidden>
    </PostHeader>
  )
})
