import { Box, ButtonBase, styled } from '@mui/material'
import { IconArrowsDiagonal } from '@tabler/icons-react'
import { Row } from 'components/elements/Layouts/Flex'
import UserHeader from 'components/elements/User/UserHeader'
import { useMobile } from 'hooks/useMobile'
import { values } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { useStore } from 'stores'
import { PostStore } from 'stores/modules/post.store'
import PostActions from '../PostActions/PostActions'
import PostContent from '../PostContent'
import PostOptions from '../PostOptions'

type Props = {
  replies: PostStore
  level?: number
}

const VerticalLineContainer = styled(Box)({
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

const VerticalLine = styled(Box)(({ theme }) =>
  theme.unstable_sx({
    position: 'relative',
    top: 0,
    left: 6,
    width: '2px',
    height: '100%',
    pointerEvents: 'none',
    backgroundColor: 'dividerSolid',
  }),
)

const Anchor = styled(Box)(({ theme }) =>
  theme.unstable_sx({
    position: 'absolute',
    left: -21,
    top: 6,
    width: 16,
    height: 16,
    borderLeft: '2px solid',
    borderBottom: '2px solid',
    borderColor: 'dividerSolid',
    borderBottomLeftRadius: 16,
  }),
)

const CollapsedButton = styled(ButtonBase)(({ theme }) =>
  theme.unstable_sx({
    width: '100%',
    py: 1,
    px: 2,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    mb: 1,
    cursor: 'pointer',
    justifyContent: 'flex-start',
    zIndex: 100,
  }),
)

export const PostRepliesTree = observer(function PostRepliesTree(props: {
  replies: readonly PostStore[]
  level: number
}) {
  const { replies, level } = props
  return replies.map((reply) => <PostReply key={reply.id} level={level} replies={reply} />)
})

const PostReply = observer(function PostReply(props: Props) {
  const { replies, level = 0 } = props
  const isMobile = useMobile()
  const collapsedLevel = isMobile ? 4 : 6
  const [open, setOpen] = useState(level < collapsedLevel)
  const { dialogs } = useStore()
  const event = replies.event

  const handleOpen = useCallback(() => {
    setOpen(!open)
  }, [open])

  const handleOpenNestedDialog = useCallback(() => {
    if (replies.parent?.parent) {
      dialogs.pushReply(replies.parent?.parent)
    }
  }, [dialogs, replies])

  if (!event) {
    return <></>
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
          <CollapsedButton onClick={level < collapsedLevel ? handleOpen : handleOpenNestedDialog}>
            <Row>
              <IconArrowsDiagonal strokeWidth='2.0' size={18} />
              <Box component='span' sx={{ ml: 2, pointerEvents: 'none' }}>
                <UserHeader dense event={replies.event} />
              </Box>
            </Row>
          </CollapsedButton>
        )}
        {open && (
          <>
            <Row sx={{ position: 'relative' }}>
              {level !== 1 && <Anchor />}
              <Box sx={{ flex: 1 }}>
                <UserHeader alignCenter={false} event={replies.event} />
                <Box sx={{ ml: 7, mt: -2.2 }}>
                  <PostContent dense event={event} />
                </Box>
              </Box>
              <PostOptions post={replies} />
            </Row>
            <Box sx={{ ml: 6, py: 0.2 }}>
              <PostActions dense post={replies} onReplyClick={() => {}} />
            </Box>
            {replies.hasReplies && <PostRepliesTree replies={values(replies.replies)} level={level + 1} />}
          </>
        )}
      </Box>
    </>
  )
})

export default PostReply
