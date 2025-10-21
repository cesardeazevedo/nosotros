import { useContentContext } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useEventReplies } from '@/hooks/query/useReplies'
import type { NoteState } from '@/hooks/state/useNote'
import { useMobile } from '@/hooks/useMobile'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { PostOptions } from '../PostOptions'
import { ButtonReaction } from './PostButtonReaction'
import { ButtonReply } from './PostButtonReply'
import { ButtonRepost } from './PostButtonRepost'
import { PostButtonStats } from './PostButtonStats'
import { ButtonZap } from './PostButtonZap'

type Props = {
  note: NoteState
  onReplyClick?: () => void
  renderReply?: boolean
  renderOptions?: boolean
  statsPopover?: boolean
  sx?: SxProps
}

export const PostActions = memo(function PostActions(props: Props) {
  const { note, renderReply = true, renderOptions = false, statsPopover, sx } = props
  const { dense } = useContentContext()
  const { total } = useEventReplies(note.event, { pageSize: note.state.pageSize })
  const mobile = useMobile()

  return (
    <Stack horizontal sx={[styles.root, dense && styles.root$dense, sx]} gap={dense ? 0 : mobile ? 0 : 1}>
      <ButtonReaction />
      <ButtonRepost />
      {renderReply && (
        <ButtonReply
          value={total}
          selected={(note.state.repliesOpen && note.event.metadata?.isRoot) || note.state.isReplying || false}
          onClick={props.onReplyClick}
        />
      )}
      <ButtonZap />
      <PostButtonStats popover={statsPopover} note={note} />
      {renderOptions && <PostOptions event={note.event} />}
    </Stack>
  )
})

const styles = css.create({
  root: {
    padding: 16,
    justifyContent: 'space-between',
  },
  root$dense: {
    padding: 0,
    justifyContent: 'flex-start',
  },
})
