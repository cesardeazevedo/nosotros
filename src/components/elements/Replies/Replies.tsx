import { Stack } from '@/components/ui/Stack/Stack'
import { useEventReplies } from '@/hooks/query/useReplies'
import type { NoteState } from '@/hooks/state/useNote'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { RepliesLoadMore } from './RepliesLoadMore'
import { RepliesTree } from './RepliesTree'

type Props = {
  note: NoteState
}

export const Replies = memo(function Replies(props: Props) {
  const { note } = props
  const { chunk: replies } = useEventReplies(note.event, { pageSize: note.state.pageSize })

  return (
    <Stack horizontal={false} sx={styles.root} justify='flex-start'>
      <html.div style={styles.root}>
        {replies.length !== 0 && <RepliesTree replies={replies} repliesOpen={note.state.repliesOpen} level={1} />}
        {/* <RepliesMuted level={0} /> */}
        <RepliesLoadMore note={note} />
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
