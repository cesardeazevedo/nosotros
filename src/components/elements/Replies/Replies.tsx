import { Stack } from '@/components/ui/Stack/Stack'
import { useEventReplies, useLiveReplies } from '@/hooks/query/useReplies'
import type { NoteState } from '@/hooks/state/useNote'
import { spacing } from '@/themes/spacing.stylex'
import type { RefObject } from 'react'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { RepliesLoadMore } from './RepliesLoadMore'
import { RepliesTree } from './RepliesTree'

type Props = {
  note: NoteState
  level?: number
  limit?: number
  ref?: RefObject<HTMLDivElement | null>
  renderLoadMore?: boolean
}

export const Replies = memo(function Replies(props: Props) {
  const { note, limit, level = 1, ref, renderLoadMore = true } = props
  const { chunk: replies } = useEventReplies(note.event, { pageSize: note.state.pageSize })
  useLiveReplies(note.event)

  return (
    <Stack horizontal={false} sx={styles.root} justify='flex-start' ref={ref}>
      {replies.length !== 0 && (
        <RepliesTree limit={limit} replies={replies} repliesOpen={note.state.repliesOpen} level={level} />
      )}
      {/* <RepliesMuted level={0} /> */}
      {renderLoadMore && <RepliesLoadMore note={note} />}
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    paddingTop: spacing.padding1,
  },
})
