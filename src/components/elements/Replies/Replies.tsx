import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { memo, useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import { RepliesLoadMore } from './RepliesLoadMore'
import { RepliesTree } from './RepliesTree'

export const Replies = memo(function Replies() {
  const { note } = useNoteContext()

  const replies = note.repliesChunk

  const handleLoadMore = useCallback(() => {
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
