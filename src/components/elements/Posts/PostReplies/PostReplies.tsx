import { NostrClientContext } from '@/components/providers/NostrProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useCallback, useContext } from 'react'
import { css, html } from 'react-strict-dom'
import type { Note } from 'stores/models/note'
import { PostLoadMore } from '../PostLoadMore'
import { PostRepliesEmpty } from './PostRepliesEmpty'
import { PostRepliesLoading } from './PostRepliesLoading'
import { PostRepliesTree } from './PostReply'

type Props = {
  note: Note
  loadingRows?: number
  renderEmpty?: boolean
  onLoadMoreClick?: () => void
}

export const PostReplies = observer(function PostReplies(props: Props) {
  const { note, loadingRows, renderEmpty = false } = props
  const isMobile = useMobile()

  const { user } = useContext(NostrClientContext)

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
        {replies && note && <PostRepliesTree replies={replies} repliesOpen={note.repliesOpen} level={1} />}
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
    paddingBlock: spacing.padding1,
  },
})
