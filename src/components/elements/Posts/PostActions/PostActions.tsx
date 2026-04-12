import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useEventReplies } from '@/hooks/query/useReplies'
import { useMobile } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import { useNavigate } from '@tanstack/react-router'
import { memo, useCallback } from 'react'
import { css } from 'react-strict-dom'
import { PostOptions } from '../PostOptions'
import { PostStats } from '../PostStats'
import { ButtonReaction } from './PostButtonReaction'
import { ButtonReply } from './PostButtonReply'
import { ButtonRepost } from './PostButtonRepost'
import { PostButtonStats } from './PostButtonStats'
import { ButtonZap } from './PostButtonZap'

type Props = {
  onReplyClick?: () => void
  renderReply?: boolean
  renderOptions?: boolean
  statsPopover?: boolean
  sx?: SxProps
}

export const PostActions = memo(function PostActions(props: Props) {
  const { renderReply = true, renderOptions = false, statsPopover, sx } = props
  const { dense } = useContentContext()
  const { note } = useNoteContext()
  const { total } = useEventReplies(note.event, { pageSize: note.state.pageSize })
  const mobile = useMobile()
  const navigate = useNavigate()

  const handleReplyInDialog = useCallback(() => {
    navigate({
      to: '.',
      search: (old) => ({ ...old, replying: note.nip19 as string }),
    })
  }, [navigate, note.nip19])

  return (
    <>
      <ContentProvider value={{ dense }}>
        <Stack
          horizontal
          justify='space-between'
          sx={[styles.root, dense && styles.root$dense, sx]}
          gap={dense ? 1 : mobile ? 0 : 1}>
          <ButtonReaction />
          <ButtonRepost />
          {renderReply && (
            <ButtonReply
              value={total}
              selected={(note.state.repliesOpen && note.event.metadata?.isRoot) || note.state.isReplying || false}
              onClick={props.onReplyClick || handleReplyInDialog}
            />
          )}
          <ButtonZap />
          <PostButtonStats popover={statsPopover} note={note} />
          {renderOptions && <PostOptions event={note.event} />}
        </Stack>
        <PostStats note={note} renderDivider />
      </ContentProvider>
    </>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding1,
    // paddingInline: spacing.padding2,
  },
  root$dense: {
    paddingInline: 0,
    paddingBlock: spacing['padding0.5'],
    justifyContent: 'flex-start',
  },
})
