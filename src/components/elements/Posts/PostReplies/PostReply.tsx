import { NoteContext } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentUser } from '@/hooks/useRootStore'
import type { Comment } from '@/stores/comment/comment'
import type { Note } from '@/stores/notes/note'
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
import { Editor } from '../../Editor/Editor'
import { useNoteVisibility } from '../hooks/useNoteVisibility'
import { PostActions } from '../PostActions/PostActions'
import { PostRepliesMuted } from './PostRepliesMuted'
import { PostReplyContent } from './PostReplyContent'

type Props = {
  note: Note | Comment
  nested?: boolean
  repliesOpen: boolean | null
  level?: number
}

export const PostRepliesTree = observer(function PostRepliesTree(props: {
  repliesOpen: boolean | null
  replies: (Note | Comment)[]
  level: number
  nested?: boolean
}) {
  const { replies, ...rest } = props
  return replies.map((note) => <PostReply key={note.id} note={note} {...rest} />)
})

const MAX_LEVEL = 7

export const PostReply = observer(function PostReply(props: Props) {
  const { note, level = 0, repliesOpen, nested = true } = props
  const navigate = useNavigate()
  const router = useRouter()
  const isMobile = useMobile()
  const collapsedLevel = isMobile ? 4 : 4
  const [open, setOpen] = useState(level < collapsedLevel)
  const [ref] = useNoteVisibility(note, { replies: false })
  const user = useCurrentUser()
  const event = note.event

  const handleOpen = useCallback(() => {
    setOpen(!open)
  }, [open])

  const handleOpenNestedDialog = useCallback(() => {
    navigate({
      // @ts-ignore
      // to: './replies/$nevent',
      to: '/$nostr',
      // @ts-ignore
      params: { nostr: note.nevent },
      // @ts-ignore
      state: { from: router.latestLocation.pathname },
    })
  }, [note, router])

  // For preview
  if (repliesOpen === null && level >= 3) {
    return
  }

  return (
    <html.div style={[styles.root, level > 1 && styles.root$deep]} ref={ref}>
      {open && <html.span style={styles.verticalLineContainer} onClick={handleOpen} />}
      {!open && (
        <Stack align='flex-start' gap={1} onClick={level < MAX_LEVEL ? handleOpen : handleOpenNestedDialog}>
          <UserAvatar size='md' pubkey={event.pubkey} disableLink />
          <BubbleContainer sx={styles.expandButton}>
            <UserName pubkey={event.pubkey} disableLink />
            <Button variant='text'>See more {note.repliesTotal + 1} Replies</Button>
          </BubbleContainer>
        </Stack>
      )}
      {open && (
        <>
          <NoteContext.Provider value={{ dense: true }}>
            <Stack align='flex-start'>
              {level !== 1 && <html.div style={styles.anchor} />}
              <UserAvatar pubkey={event.pubkey} />
              <Stack gap={1} sx={styles.content}>
                <PostReplyContent note={note} />
              </Stack>
            </Stack>
            <html.div style={styles.actions}>
              <Stack>
                <PostActions renderOptions note={note} onReplyClick={() => note.toggleReplying()} />
              </Stack>
              <Expandable expanded={note.isReplying} trigger={() => <></>}>
                {note.isReplying && <Editor dense initialOpen renderBubble renderDiscard={false} store={note.editor} />}
              </Expandable>
            </html.div>
          </NoteContext.Provider>
          {nested && (
            <PostRepliesTree
              replies={note.repliesSorted(user)}
              repliesOpen={repliesOpen}
              level={level + 1}
              nested={nested}
            />
          )}
        </>
      )}
      <PostRepliesMuted level={level} note={note} />
    </html.div>
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
  content: {
    width: '100%',
    marginInline: spacing.margin1,
  },
  expandButton: {
    marginBottom: spacing.padding1,
  },
})
