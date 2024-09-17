import { Stack } from '@/components/ui/Stack/Stack'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconArrowsDiagonal } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { BubbleContainer } from 'components/elements/Content/Layout/Bubble'
import UserAvatar from 'components/elements/User/UserAvatar'
import UserName from 'components/elements/User/UserName'
import { AnimatePresence, motion } from 'framer-motion'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type Note from 'stores/models/note'
import { noteStore } from 'stores/nostr/notes.store'
import { userStore } from 'stores/nostr/users.store'
import PostActions from '../PostActions/PostActions'
import PostCreateForm from '../PostCreate/PostCreateForm'
import PostOptions from '../PostOptions'
import PostReplyContent from './PostReplyContent'

type Props = {
  note: Note
  repliesOpen: boolean | null
  level?: number
}

export const PostRepliesTree = observer(function PostRepliesTree(props: {
  repliesOpen: boolean | null
  replies: Note[]
  level: number
}) {
  const { replies, ...rest } = props
  return replies.map((note) => {
    return note && <PostReply key={note.id} note={note} {...rest} />
  })
})

const PostReply = observer(function PostReply(props: Props) {
  const { note, level = 0, repliesOpen } = props
  const router = useRouter()
  const isMobile = useMobile()
  const collapsedLevel = isMobile ? 4 : 6
  const [open, setOpen] = useState(level < collapsedLevel)
  const [replyOpen, setReplyOpen] = useState(false)
  const event = note.event
  const user = userStore.get(event?.pubkey)

  const handleOpen = useCallback(() => {
    setOpen(!open)
  }, [open])

  const handleOpenNestedDialog = useCallback(() => {
    if (note.meta.parentNoteId) {
      const parent = noteStore.get(note.meta.parentNoteId)
      if (parent) {
        router.navigate({
          // @ts-ignore
          to: './replies/$nevent',
          // @ts-ignore
          params: { nevent: parent.nevent },
          // @ts-ignore
          state: { from: router.latestLocation.pathname },
        })
      }
    }
  }, [note, router])

  // Cut off replies of replies if the section isn't open
  if (repliesOpen === null && level >= 3) {
    return
  }

  return (
    <html.div style={[styles.root, level > 1 && styles.root$deep]}>
      {open && <html.span style={styles.verticalLineContainer} onClick={handleOpen} />}
      {!open && (
        <Stack align='flex-start' gap={1} onClick={level < collapsedLevel ? handleOpen : handleOpenNestedDialog}>
          <UserAvatar size='md' user={user} disableLink />
          <BubbleContainer sx={styles.expandButton}>
            <UserName user={user} disableLink />
            <IconArrowsDiagonal strokeWidth='2.0' size={18} />
          </BubbleContainer>
        </Stack>
      )}
      {open && (
        <>
          <Stack align='flex-start'>
            {level !== 1 && <html.div style={styles.anchor} />}
            <UserAvatar user={user} />
            <Stack gap={1} sx={styles.content}>
              <PostReplyContent note={note} />
              <PostOptions dense note={note} />
            </Stack>
          </Stack>
          <html.div style={styles.actions}>
            <PostActions dense note={note} onReplyClick={() => setReplyOpen((prev) => !prev)} />
            <AnimatePresence mode='wait'>
              {replyOpen && (
                <motion.div
                  transition={{ duration: 0.1, easings: 'easeIn' }}
                  initial={{ minHeight: 0, height: 0, opacity: 0 }}
                  animate={{ minHeight: 121, height: 'auto', opacity: 1 }}
                  exit={{ minHeight: 0, height: 0, opacity: 0 }}>
                  <PostCreateForm dense renderBubble renderDiscard={false} />
                </motion.div>
              )}
            </AnimatePresence>
          </html.div>
          {note.hasReplies && (
            <PostRepliesTree
              replies={
                repliesOpen === null ? note.replies.slice(0, 1).filter((x) => x.isCurrentUserFollowing) : note.replies
              }
              repliesOpen={repliesOpen}
              level={level + 1}
            />
          )}
        </>
      )}
    </html.div>
  )
})

const styles = css.create({
  root: {
    width: 'auto',
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
    borderBottomLeftRadius: 16,
  },
  actions: {
    padding: 0,
    paddingTop: spacing['padding0.5'],
    paddingBottom: spacing.padding2,
    marginLeft: spacing.margin6,
  },
  content: {
    width: '100%',
    marginInline: spacing.margin1,
  },
  expandButton: {
    marginBottom: spacing.padding1,
  },
  createNote: {
    padding: 0,
  },
})
