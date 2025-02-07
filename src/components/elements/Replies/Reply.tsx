import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { useNoteStore } from '@/hooks/useNoteStore'
import { useCurrentUser } from '@/hooks/useRootStore'
import type { NostrEventComment, NostrEventNote } from '@/nostr/types'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { BubbleContainer } from 'components/elements/Content/Layout/Bubble'
import { UserAvatar } from 'components/elements/User/UserAvatar'
import { UserName } from 'components/elements/User/UserName'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { Editor } from '../Editor/Editor'
import { useNoteVisibility } from '../Posts/hooks/useNoteVisibility'
import { PostActions } from '../Posts/PostActions/PostActions'
import { RepliesMuted } from './RepliesMuted'
import { RepliesTree } from './RepliesTree'
import { ReplyContent } from './ReplyContent'

type Props = {
  event: NostrEventNote | NostrEventComment
  nested?: boolean
  repliesOpen: boolean | null
  level?: number
}

export const Reply = observer(function Reply(props: Props) {
  const { event, level = 0, repliesOpen, nested = true } = props
  const note = useNoteStore(event)
  const navigate = useNavigate()
  const router = useRouter()
  const isMobile = useMobile()
  const collapsedLevel = isMobile ? 5 : 6
  const [open, setOpen] = useState(level < collapsedLevel)
  const [ref] = useNoteVisibility(event, { replies: false })
  const user = useCurrentUser()
  const { blured } = useContentContext()

  const handleOpen = useCallback(() => {
    setOpen(!open)
  }, [open])

  const handleOpenNestedDialog = useCallback(() => {
    navigate({
      to: '/$nostr',
      params: { nostr: note.event.nevent as string },
      state: { from: router.latestLocation.pathname } as never,
    })
  }, [note, router])

  // For preview
  if (repliesOpen === null && level >= 3) {
    return
  }

  return (
    <NoteProvider value={{ note }}>
      <ContentProvider value={{ blured, dense: true }}>
        <html.div style={[styles.root, level > 1 && styles.root$deep]} ref={ref}>
          {open && <html.span style={styles.verticalLineContainer} onClick={handleOpen} />}
          {!open && (
            <ContentProvider value={{ blured, dense: true, disableLink: true }}>
              <Stack align='flex-start' gap={1} onClick={level < collapsedLevel ? handleOpen : handleOpenNestedDialog}>
                <UserAvatar size='md' pubkey={event.pubkey} />
                <BubbleContainer sx={styles.expandButton}>
                  <UserName pubkey={event.pubkey} />
                  <Button variant='text'>See more {note.repliesTotal + 1} Replies</Button>
                </BubbleContainer>
              </Stack>
            </ContentProvider>
          )}
          {open && (
            <>
              <Stack align='flex-start' gap={1}>
                {level !== 1 && <html.div style={styles.anchor} />}
                <UserAvatar pubkey={event.pubkey} />
                <ReplyContent />
              </Stack>
              <html.div style={styles.actions}>
                <Stack>
                  <PostActions renderOptions renderRelays={false} onReplyClick={() => note.toggleReplying()} />
                </Stack>
                <Expandable expanded={note.isReplying} trigger={() => <></>}>
                  {note.isReplying && <Editor initialOpen renderBubble renderDiscard={false} store={note.editor} />}
                </Expandable>
              </html.div>
              {nested && (
                <RepliesTree
                  replies={note.repliesSorted(user)}
                  repliesOpen={repliesOpen}
                  level={level + 1}
                  nested={nested}
                />
              )}
            </>
          )}
          <RepliesMuted level={level} />
        </html.div>
      </ContentProvider>
    </NoteProvider>
  )
})

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
    position: 'relative',
  },
  root$deep: {
    marginLeft: spacing.margin3,
  },
  verticalLineContainer: {
    position: 'absolute',
    top: 50,
    left: 28,
    bottom: 10,
    width: 12,
    cursor: 'pointer',
    ':before': {
      content: '',
      position: 'relative',
      top: 0,
      left: 6,
      width: 2,
      borderRadius: 4,
      height: '100%',
      pointerEvents: 'none',
      display: 'inline-block',
      backgroundColor: palette.outlineVariant,
    },
    ':hover::before': {
      backgroundColor: 'gray',
    },
  },
  anchor: {
    position: 'absolute',
    left: -6,
    top: 6,
    width: 16,
    height: 16,
    borderLeft: '2px solid',
    borderBottom: '2px solid',
    borderLeftColor: palette.outlineVariant,
    borderBottomColor: palette.outlineVariant,
    borderBottomLeftRadius: 12,
  },
  actions: {
    padding: 0,
    paddingTop: spacing['padding0.5'],
    paddingBottom: spacing.padding2,
    paddingLeft: spacing.margin6,
  },
  expandButton: {
    marginBottom: spacing.padding1,
  },
})
