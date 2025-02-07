import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useCurrentUser } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import { PostLoadMore } from '../Posts/PostLoadMore'
import { RepliesMuted } from './RepliesMuted'
import { RepliesTree } from './RepliesTree'

type Props = {
  onLoadMoreClick?: () => void
}

export const Replies = observer(function Replies(props: Props) {
  const user = useCurrentUser()
  const isMobile = useMobile()
  const { note } = useNoteContext()

  const replies = note.repliesChunk(user)

  const handleLoadMore = useCallback(() => {
    if (isMobile && props.onLoadMoreClick) {
      return props.onLoadMoreClick()
    }
    note.paginate()
  }, [])

  return (
    <Stack horizontal={false} sx={styles.root} justify='flex-start'>
      <html.div style={styles.root}>
        {replies.length > 0 && note && <RepliesTree replies={replies} repliesOpen={note.repliesOpen} level={1} />}
        <RepliesMuted level={0} />
        <PostLoadMore note={note} onClick={handleLoadMore} />
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
