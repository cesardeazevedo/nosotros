import { Typography } from '@mui/material'
import { IconAlertCircle } from '@tabler/icons-react'
import React from 'react'
import Bubble from './PostReplies/PostReplyBubble'

type Props = {
  kind: number
  bubble?: boolean
}

function PostError(props: Props) {
  const { kind, bubble } = props
  const Container = bubble ? Bubble : React.Fragment
  return (
    <Container>
      <Typography
        variant='subtitle2'
        color='text.secondary'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2,
          px: 3,
        }}>
        <IconAlertCircle size={30} strokeWidth='1.4' style={{ marginBottom: 12 }} />
        {`Can't display content of kind ${kind}`}
      </Typography>
    </Container>
  )
}

export default PostError
