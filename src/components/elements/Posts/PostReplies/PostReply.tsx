import { Box, styled } from '@mui/material'
import { IconArrowsDiagonal } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { Row } from 'components/elements/Layouts/Flex'
import UserAvatar from 'components/elements/User/UserAvatar'
import UserName from 'components/elements/User/UserName'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { useStore } from 'stores'
import { Note } from 'stores/modules/note.store'
import PostActions from '../PostActions/PostActions'
import PostOptions from '../PostOptions'
import Bubble from './PostReplyBubble'
import PostReplyContent from './PostReplyContent'

type Props = {
  note: Note
  repliesOpen: boolean | null
  level?: number
}

const VerticalLineContainer = styled('span')({
  position: 'absolute',
  top: 50,
  left: 13,
  bottom: 10,
  width: 12,
  zIndex: 10,
  cursor: 'pointer',
  '&:hover': {
    div: {
      backgroundColor: 'grey',
    },
  },
})

const VerticalLine = styled('div')({
  position: 'relative',
  top: 0,
  left: 6,
  width: '2px',
  height: '100%',
  pointerEvents: 'none',
  backgroundColor: 'var(--mui-palette-dividerSolid)',
})

const Anchor = styled('div')({
  position: 'absolute',
  left: -21,
  top: 6,
  width: 16,
  height: 16,
  borderLeft: '2px solid',
  borderBottom: '2px solid',
  borderColor: 'var(--mui-palette-dividerSolid)',
  borderBottomLeftRadius: 16,
})

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
  const event = note.event

  const store = useStore()
  const user = store.users.getUserById(event?.pubkey)

  const handleOpen = useCallback(() => {
    setOpen(!open)
  }, [open])

  const handleOpenNestedDialog = useCallback(async () => {
    if (note.parentNoteId) {
      const parent = await store.notes.notes.fetch(note.parentNoteId)
      if (parent) {
        router.navigate({
          to: '/$nostr/replies',
          params: { nostr: parent.nevent },
          state: {
            from: router.latestLocation.pathname,
          },
        })
      }
    }
  }, [note, router, store.notes])

  // Cut off replies of replies if the section isn't open
  if (repliesOpen === null && level >= 3) {
    return
  }

  return (
    <>
      <Box sx={{ ml: 5, pr: 0, py: 0, position: 'relative' }}>
        {open && (
          <VerticalLineContainer onClick={handleOpen}>
            <VerticalLine />
          </VerticalLineContainer>
        )}
        {!open && (
          <Row sx={{ mb: 2 }} onClick={level < collapsedLevel ? handleOpen : handleOpenNestedDialog}>
            <UserAvatar user={user} disableLink />
            <Bubble component={Row} sx={{ ml: 1 }}>
              <UserName user={user} disableLink />
              <IconArrowsDiagonal strokeWidth='2.0' size={18} style={{ marginLeft: 8 }} />
            </Bubble>
          </Row>
        )}
        {open && (
          <>
            <Row sx={{ position: 'relative' }}>
              {level !== 1 && <Anchor />}
              <Box sx={{ mr: 0.8 }}>
                <Row sx={{ alignItems: 'flex-start' }}>
                  <UserAvatar user={user} />
                  <Box sx={{ ml: 1 }}>
                    <PostReplyContent dense note={note} />
                  </Box>
                </Row>
              </Box>
              <PostOptions note={note} />
            </Row>
            <Box sx={{ ml: 6, py: 0.2 }}>
              <PostActions dense note={note} onReplyClick={() => {}} />
            </Box>
            {note.hasReplies && (
              <PostRepliesTree
                replies={repliesOpen === null ? note.replies.slice(0, 1).filter((x) => x.isFollowing) : note.replies}
                repliesOpen={repliesOpen}
                level={level + 1}
              />
            )}
          </>
        )}
      </Box>
    </>
  )
})
