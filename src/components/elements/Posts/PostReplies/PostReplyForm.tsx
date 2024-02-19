import { Box, IconButton, InputBase } from '@mui/material'
import { IconMoodSmile } from '@tabler/icons-react'
import ComingSoon from 'components/elements/Layouts/ComingSoon'
import { Row } from 'components/elements/Layouts/Flex'
import UserAvatar from 'components/elements/User/UserAvatar'
import { useStore } from 'hooks/useStore'
import { Observer } from 'mobx-react-lite'

function PostReplyForm() {
  const store = useStore()
  return (
    <Row sx={{ position: 'relative', py: 1, px: 2, alignItems: 'flex-start' }}>
      <ComingSoon variant='subtitle1' />
      <Observer>{() => <UserAvatar user={store.auth.currentUser} />}</Observer>
      <Box sx={{ ml: 1, px: 2, width: '100%', backgroundColor: 'divider', borderRadius: 2 }}>
        <InputBase
          fullWidth
          multiline
          placeholder='Post a reply!'
          sx={{ minHeight: 40 }}
          endAdornment={
            <IconButton sx={{ p: '2px', alignSelf: 'flex-end' }}>
              <IconMoodSmile strokeWidth='1.5' />
            </IconButton>
          }
        />
      </Box>
    </Row>
  )
}

export default PostReplyForm
