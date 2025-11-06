import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventReplies } from '@/hooks/query/useReplies'
import { useNoteState } from '@/hooks/state/useNote'
import { useIsCurrentRouteEventID } from '@/hooks/useNavigations'
import { useReplyTreeLayout } from '@/hooks/useReplyTreeLayout'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { BubbleContainer } from 'components/elements/Content/Layout/Bubble'
import { UserAvatar } from 'components/elements/User/UserAvatar'
import { UserName } from 'components/elements/User/UserName'
import { useMobile } from 'hooks/useMobile'
import { memo, useCallback, useDeferredValue, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { EditorProvider } from '../Editor/EditorProvider'
import { PostActions } from '../Posts/PostActions/PostActions'
import { RepliesTree } from './RepliesTree'
import { ReplyContent } from './ReplyContent'

type Props = {
  event: NostrEventDB
  nested?: boolean
  repliesOpen: boolean | null
  level?: number
}

export const Reply = memo(function Reply(props: Props) {
  const { event, level = 0, repliesOpen, nested = true } = props
  const note = useNoteState(event)
  const navigate = useNavigate()
  const router = useRouter()
  const isMobile = useMobile()
  const collapsedLevel = isMobile ? 5 : 6
  const [open, setOpen] = useState(level < collapsedLevel)
  const { blured } = useContentContext()
  const nevent = note.nip19

  const isCurrentEvent = useIsCurrentRouteEventID(event.id)

  const handleOpen = useCallback(() => setOpen((v) => !v), [])

  const handleOpenNestedDialog = useCallback(() => {
    navigate({
      to: '/$nostr',
      params: { nostr: nevent as string },
      state: { from: router.latestLocation.pathname } as never,
    })
  }, [navigate, nevent, router.latestLocation.pathname])

  const handleReplyInDialog = useCallback(() => {
    navigate({
      to: '.',
      search: (old) => ({ ...old, replying: nevent }),
    })
  }, [navigate, nevent])

  if (repliesOpen === null && level >= 3) {
    return null
  }

  const { total, sorted } = useEventReplies(event)
  const hasReplies = total > 0

  const { rootRef, avatarCellRef, childrenRef } = useReplyTreeLayout(open, hasReplies)

  const handleSeeMore = level < collapsedLevel ? handleOpen : handleOpenNestedDialog
  const isReplyingDeferred = useDeferredValue(note.state.isReplying)

  return (
    <NoteProvider value={{ event }}>
      <ContentProvider value={{ blured, dense: true }}>
        <html.div
          ref={rootRef}
          aria-level={level}
          data-reply-root='1'
          data-level={level}
          style={[styles.root, level > 1 && styles.root$deep]}>
          {!open && (
            <ContentProvider value={{ blured, dense: true, disableLink: true }}>
              <Stack align='flex-start' gap={1} onClick={handleSeeMore} sx={styles.wrapper}>
                {level !== 1 && <html.div style={styles.anchor} />}
                <html.div ref={avatarCellRef} style={styles.avatarCell} data-reply-avatar='1'>
                  {hasReplies && <html.span aria-hidden style={styles.connectorDown} onClick={handleOpen} />}
                  <UserAvatar size='md' pubkey={event.pubkey} />
                </html.div>
                <BubbleContainer sx={styles.expandButton}>
                  <UserName pubkey={event.pubkey} />
                  <Button variant='text'>See more {total + 1} Replies</Button>
                </BubbleContainer>
              </Stack>
            </ContentProvider>
          )}
          {open && (
            <>
              <Stack align='flex-start' gap={1} sx={styles.wrapper}>
                {level !== 1 && <html.div style={styles.anchor} />}
                <html.div ref={avatarCellRef} style={styles.avatarCell} data-reply-avatar='1'>
                  {hasReplies && <html.span aria-hidden style={styles.connectorDown} onClick={handleOpen} />}
                  <UserAvatar pubkey={event.pubkey} />
                </html.div>
                <ContentProvider value={{ disableLink: isCurrentEvent }}>
                  <ReplyContent note={note} />
                </ContentProvider>
              </Stack>
              <html.div style={styles.actions}>
                <PostActions
                  renderOptions
                  statsPopover
                  note={note}
                  onReplyClick={() => {
                    if ((nested && level > 3) || isMobile) {
                      handleReplyInDialog()
                    } else {
                      note.actions.toggleReplying()
                    }
                  }}
                />
                {note.state.isReplying && (
                  <Expandable expanded={isReplyingDeferred} trigger={() => <></>}>
                    <EditorProvider sx={styles.editor} initialOpen renderBubble parent={event} />
                  </Expandable>
                )}
              </html.div>
              {nested && (
                <html.div ref={childrenRef}>
                  <RepliesTree replies={sorted} repliesOpen={repliesOpen} level={level + 1} nested={nested} />
                </html.div>
              )}
            </>
          )}
        </html.div>
      </ContentProvider>
    </NoteProvider>
  )
})

const CONNECTOR_WIDTH = 3

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
    position: 'relative',
    '--connector-height': '0px',
  },
  root$deep: {
    width: 'calc(100% - 18px)',
    marginLeft: spacing.margin3,
  },
  wrapper: {
    width: '100%',
    position: 'relative',
  },
  anchor: {
    position: 'absolute',
    left: -22,
    top: 6,
    width: 19,
    height: 16,
    borderLeft: '3px solid',
    borderBottom: '3px solid',
    borderLeftColor: palette.outlineVariant,
    borderBottomColor: palette.outlineVariant,
    borderBottomLeftRadius: 18,
  },
  avatarCell: {
    position: 'relative',
    alignItems: 'center',
  },
  connectorDown: {
    position: 'absolute',
    left: 18,
    top: '110%',
    width: CONNECTOR_WIDTH,
    height: 'calc(var(--connector-height) - 36px)',
    borderRadius: 4,
    zIndex: 1,
    backgroundColor: palette.outlineVariant,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'gray',
    },
  },
  actions: {
    padding: 0,
    paddingTop: spacing['padding0.5'],
    paddingBottom: spacing.padding2,
    paddingLeft: spacing.margin6,
  },
  editor: {
    paddingInline: 0,
  },
  expandButton: {
    width: 'fit-content',
    marginBottom: spacing.padding1,
  },
})
