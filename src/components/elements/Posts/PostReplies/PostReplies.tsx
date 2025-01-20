import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useCurrentUser } from '@/hooks/useRootStore'
import type { Note } from '@/stores/notes/note'
import { useNoteStats } from '@/stores/notes/note.hooks'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import { PostLoadMore } from '../PostLoadMore'
import { PostRepliesEmpty } from './PostRepliesEmpty'
import { PostRepliesLoading } from './PostRepliesLoading'
import { PostRepliesMuted } from './PostRepliesMuted'
import { PostRepliesTree } from './PostReply'

type Props = {
  note: Note
  loadingRows?: number
  renderEmpty?: boolean
  onLoadMoreClick?: () => void
}

export const PostReplies = observer(function PostReplies(props: Props) {
  const { note, loadingRows, renderEmpty = false } = props
  useNoteStats(note.root || note, { replies: true })

  const user = useCurrentUser()
  const isMobile = useMobile()

  const replies = note.repliesChunk(user)

  const loading = note.isLoading
  const empty = note.isEmpty

  const handleLoadMore = useCallback(() => {
    if (isMobile && props.onLoadMoreClick) {
      return props.onLoadMoreClick()
    }
    note.paginate()
  }, [])

  return (
    <Stack horizontal={false} sx={styles.root} justify='flex-start'>
      <html.div style={styles.root}>
        {replies.length > 0 && note && <PostRepliesTree replies={replies} repliesOpen={note.repliesOpen} level={1} />}
        <PostRepliesMuted level={0} note={note} />
        {empty && renderEmpty && <PostRepliesEmpty />}
        {loading && empty !== true && <PostRepliesLoading rows={loadingRows} />}
        {note.hasRepliesLeft && <PostLoadMore note={note} onClick={handleLoadMore} />}
      </html.div>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    paddingTop: spacing.padding1,
  },
})
