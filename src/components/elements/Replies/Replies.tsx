import { Stack } from '@/components/ui/Stack/Stack'
import type { NoteState } from '@/hooks/state/useNote'
import { useMobile } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import { memo, useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import { RepliesLoadMore } from './RepliesLoadMore'
import { RepliesTree } from './RepliesTree'

type Props = {
  note: NoteState
  onLoadMoreClick?: () => void
}

export const Replies = memo(function Replies(props: Props) {
  const isMobile = useMobile()
  const { note } = props

  const replies = note.repliesChunk

  const handleLoadMore = useCallback(() => {
    if (isMobile && props.onLoadMoreClick) {
      return props.onLoadMoreClick()
    }
    note.paginate()
  }, [])

  return (
    <Stack horizontal={false} sx={styles.root} justify='flex-start'>
      <html.div style={styles.root}>
        {replies.length !== 0 && <RepliesTree replies={replies} repliesOpen={note.state.repliesOpen} level={1} />}
        {/* <RepliesMuted level={0} /> */}
        <RepliesLoadMore note={note} onClick={handleLoadMore} />
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
