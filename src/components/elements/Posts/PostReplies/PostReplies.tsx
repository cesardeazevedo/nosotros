import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import type Note from 'stores/models/note'
import { PostRepliesEmpty } from './PostRepliesEmpty'
import PostRepliesLoading from './PostRepliesLoading'
import { PostRepliesTree } from './PostReply'

type Props = {
  note?: Note
  loadingRows?: number
  renderEmpty?: boolean
}

const PostReplies = observer(function PostReplies(props: Props) {
  const { note, loadingRows, renderEmpty = false } = props

  const replies = note?.repliesOpen === null ? note.repliesPreview : note?.repliesSorted

  const loading = note ? note.repliesStatus === 'LOADING' : true
  const empty = note ? note?.repliesStatus === 'LOADED' && replies?.length === 0 : undefined

  if (note?.repliesOpen === false || (!loading && empty)) {
    return
  }

  return (
    <Stack horizontal={false} sx={styles.root} justify='flex-start'>
      <html.div style={styles.repliesWrapper}>
        {replies && note && <PostRepliesTree replies={replies} repliesOpen={note.repliesOpen} level={1} />}
        {empty && renderEmpty && <PostRepliesEmpty />}
        {loading && empty !== true && <PostRepliesLoading rows={loadingRows} />}
      </html.div>
    </Stack>
  )
})

const styles = css.create({
  root: {},
  repliesWrapper: {
    width: '100%',
    paddingBlock: spacing.padding1,
  },
})

export default PostReplies
