import { useDeckColumn } from '@/components/modules/Deck/hooks/useDeck'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { useEventReplies } from '@/hooks/query/useReplies'
import type { NoteState } from '@/hooks/state/useNote'
import { useIsCurrentRouteEventID } from '@/hooks/useNavigations'
import { useReplyTreeLayout } from '@/hooks/useReplyTreeLayout'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconDotsVertical } from '@tabler/icons-react'
import { memo, useEffect, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { WaveDivider } from '../Layouts/WaveDivider'
import { PostActions } from '../Posts/PostActions/PostActions'
import { Replies } from '../Replies/Replies'
import { ReplyContent } from '../Replies/ReplyContent'
import { UserAvatar } from '../User/UserAvatar'
import { ThreadEditor } from './ThreadEditor'

type Props = {
  note: NoteState
  renderEditor?: boolean
  renderReplies?: boolean
  renderThreadIndicator?: boolean
  forceThreadIndicator?: boolean
  renderDivider?: boolean
  repliesLimit?: number
  onEditorDiscard?: () => void
}

export const ThreadItem = memo(function ThreadItem(props: Props) {
  const {
    note,
    renderEditor = true,
    renderReplies = true,
    renderThreadIndicator = true,
    forceThreadIndicator = false,
    renderDivider = true,
    repliesLimit,
    onEditorDiscard,
  } = props
  const { event } = note
  const ref = useRef<HTMLDivElement>(null)
  const deck = useDeckColumn()
  const isCurrentRoute = useIsCurrentRouteEventID(event)
  const isDeck = deck?.type === 'event' && deck.filter?.ids?.[0] === event.id
  const isCurrentEvent = isDeck || isCurrentRoute

  useEffect(() => {
    if (isCurrentEvent && ref.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
      }, 100)
    }
  }, [isCurrentEvent, note.id])

  const hasReplies = useEventReplies(note.event, { pageSize: note.state.pageSize }).total > 0

  const { rootRef, avatarCellRef, childrenRef } = useReplyTreeLayout(true, hasReplies)

  return (
    <>
      <ContentProvider value={{ dense: true }}>
        <html.div style={styles.reply} ref={ref} data-reply-root='1'>
          {isCurrentEvent && <html.div style={styles.current}></html.div>}
          <Stack align='flex-start' gap={1} sx={styles.content}>
            {renderThreadIndicator && (hasReplies || forceThreadIndicator) && <html.div style={styles.thread} />}
            <html.div data-reply-avatar='1'>
              <UserAvatar pubkey={event.pubkey} />
            </html.div>
            <Stack horizontal={false} sx={styles.wrapper}>
              <ContentProvider value={{ disableLink: isCurrentEvent }}>
                <ReplyContent note={note} highlight={!isCurrentEvent} />
              </ContentProvider>
              <html.div style={styles.root$actions}>
                <PostActions
                  renderOptions
                  statsPopover
                  note={note}
                  onReplyClick={() => note.actions.toggleReplying()}
                />
              </html.div>
            </Stack>
          </Stack>
        </html.div>
        {renderEditor && isCurrentEvent && renderDivider && (
          <Stack sx={styles.divider} gap={2}>
            <html.div>
              <IconDotsVertical strokeWidth='2.4' size={24} />
            </html.div>
            <WaveDivider />
          </Stack>
        )}
        {renderEditor && <ThreadEditor note={note} onEditorDiscard={onEditorDiscard} />}
      </ContentProvider>
      {(renderReplies || note.state.repliesOpen === true) && (
        <Stack sx={styles.replies} ref={rootRef}>
          <html.span style={styles.anchor} ref={avatarCellRef} />
          <html.span aria-hidden style={styles.connectorDown} />
          <Replies ref={childrenRef} note={note} limit={repliesLimit} level={2} renderLoadMore={false} />
        </Stack>
      )}
    </>
  )
})

const styles = css.create({
  root$actions: {
    paddingTop: spacing.padding1,
  },
  content: {
    paddingBlock: spacing.padding1,
  },
  wrapper: {
    width: '100%',
  },
  current: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: palette.tertiary,
  },
  thread: {
    position: 'absolute',
    top: 60,
    left: 28,
    width: 12,
    bottom: 0,
    ':before': {
      content: '',
      position: 'relative',
      top: 0,
      left: 6,
      width: 3,
      borderRadius: 4,
      height: '100%',
      pointerEvents: 'none',
      display: 'inline-block',
      backgroundColor: palette.outlineVariant,
    },
  },
  reply: {
    '--connector-height': '0px',
    position: 'relative',
    paddingInline: spacing.padding2,
    scrollMargin: 64,
  },
  divider: {
    paddingTop: spacing.padding2,
    paddingBottom: spacing.padding1,
    paddingLeft: 24,
    color: palette.outlineVariant,
  },
  replies: {
    position: 'relative',
    paddingLeft: spacing.margin2,
  },
  anchor: {
    position: 'absolute',
    width: 3,
    height: 3,
    top: 12,
    left: 33.5,
  },
  connectorDown: {
    position: 'absolute',
    left: 34,
    top: 14,
    width: 3,
    height: 'calc(var(--connector-height) - 32px)',
    borderRadius: 4,
    zIndex: 1,
    backgroundColor: palette.outlineVariant,
    cursor: 'pointer',
  },
})
