import { useDeckColumn } from '@/components/modules/Deck/hooks/useDeck'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NoteState } from '@/hooks/state/useNote'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconDotsVertical } from '@tabler/icons-react'
import { useMatch } from '@tanstack/react-router'
import { memo, useEffect, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { EditorProvider } from '../Editor/EditorProvider'
import { WaveDivider } from '../Layouts/WaveDivider'
import { PostActions } from '../Posts/PostActions/PostActions'
import { Replies } from '../Replies/Replies'
import { ReplyContent } from '../Replies/ReplyContent'
import { ReplyLink } from '../Replies/ReplyLink'
import { UserAvatar } from '../User/UserAvatar'

type Props = {
  note: NoteState
  renderEditor?: boolean
  renderReplies?: boolean
}

export const ThreadItem = memo(function ThreadItem(props: Props) {
  const { note, renderEditor = true, renderReplies = true } = props
  const { event } = note
  const ref = useRef<HTMLDivElement>(null)
  const context = useMatch({ from: '/$nostr', shouldThrow: false })?.context
  const deck = useDeckColumn()
  const isCurrentNote =
    (deck?.type === 'event' && deck.filter.ids?.[0] === event.id) ||
    (context?.decoded?.type === 'nevent' ? context?.decoded.data.id === note.id : false)

  useEffect(() => {
    if (isCurrentNote && ref.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
      }, 100)
    }
  }, [isCurrentNote, note.id])

  const hasReplies = (note.replies.data?.length || 0) > 0

  return (
    <>
      <ContentProvider value={{ dense: true }}>
        <html.div style={styles.reply} ref={ref}>
          {isCurrentNote && <html.div style={styles.current}></html.div>}
          <Stack align='flex-start' gap={1} sx={styles.content}>
            {hasReplies && <html.div style={styles.thread} />}
            <UserAvatar pubkey={event.pubkey} />
            <Stack gap={1}>
              <Stack horizontal={false}>
                {isCurrentNote ? (
                  <ReplyContent highlight={false} />
                ) : (
                  <ReplyLink nevent={note.nip19}>
                    <ReplyContent />
                  </ReplyLink>
                )}
                <html.div style={styles.root$actions}>
                  <PostActions renderOptions onReplyClick={() => note.actions.toggleReplying()} />
                </html.div>
              </Stack>
            </Stack>
          </Stack>
        </html.div>
        {renderEditor && isCurrentNote && note.state.repliesOpen && (
          <Stack sx={styles.divider} gap={2}>
            <html.div>
              <IconDotsVertical strokeWidth='1.8' size={24} />
            </html.div>
            <WaveDivider />
          </Stack>
        )}
        {renderEditor && (
          <html.div style={styles.editor}>
            <Expandable expanded={note.state.isReplying || false} trigger={() => <></>}>
              <EditorProvider renderBubble initialOpen parent={note.event} />
            </Expandable>
          </html.div>
        )}
      </ContentProvider>
      {renderReplies && isCurrentNote && (
        <Replies
          onLoadMoreClick={() => {
            if (note.state.repliesOpen) {
              note.paginate()
            } else {
              note.actions.toggleReplies()
            }
          }}
        />
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
  editor: {
    position: 'relative',
    paddingRight: spacing.padding2,
  },
})
