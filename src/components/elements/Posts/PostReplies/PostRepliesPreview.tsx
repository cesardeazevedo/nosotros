import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentUser } from '@/hooks/useRootStore'
import type { Note } from '@/stores/notes/note'
import { spacing } from '@/themes/spacing.stylex'
import { useRouteContext } from '@tanstack/react-router'
import { css, html } from 'react-strict-dom'
import { PostLoadMore } from '../PostLoadMore'
import { PostRepliesTree } from './PostReply'

type Props = {
  note: Note
  onLoadMoreClick?: () => void
}

export const PostRepliesPreview = function PostRepliesPreview(props: Props) {
  const { note, onLoadMoreClick } = props
  const currentUser = useCurrentUser()
  const context = useRouteContext({ strict: false })

  const replies = note.getRepliesPreviewUser(currentUser, context.pubkey)

  if (note.repliesOpen !== null || replies.length === 0) {
    return null
  }

  return (
    <>
      <Divider />
      <Stack horizontal={false} sx={styles.root} justify='flex-start'>
        <html.div style={styles.repliesWrapper}>
          {replies && <PostRepliesTree nested={false} replies={replies} repliesOpen={note.repliesOpen} level={1} />}
          <PostLoadMore note={note} onClick={onLoadMoreClick} disabled={false} />
        </html.div>
      </Stack>
    </>
  )
}

const styles = css.create({
  root: {},
  repliesWrapper: {
    width: '100%',
    paddingBlock: spacing.padding1,
  },
})
