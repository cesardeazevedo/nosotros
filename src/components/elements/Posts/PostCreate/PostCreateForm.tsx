import { Box, Button, Divider, IconButton, InputBase } from '@mui/material'
import { IconMoodSmile, IconPhotoPlus, IconServerBolt } from '@tabler/icons-react'
import ComingSoon from 'components/elements/Layouts/ComingSoon'
import { Row } from 'components/elements/Layouts/Flex'
import PaperContainer from 'components/elements/Layouts/PaperContainer'
import Tooltip from 'components/elements/Layouts/Tooltip'
import UserAvatar from 'components/elements/User/UserAvatar'
import { useStore } from 'hooks/useStore'
import { Observer } from 'mobx-react-lite'
import React from 'react'

const PostCreateForm = React.memo(function PostCreateForm() {
  const store = useStore()
  return (
    <PaperContainer sx={{ position: 'relative' }}>
      <ComingSoon />
      <Row sx={{ p: 2, alignItems: 'flex-start' }}>
        <Observer>{() => <UserAvatar user={store.auth.currentUser} />}</Observer>
        <Box
          sx={{
            mx: 1,
            pt: 1,
            pl: 2,
            pr: 1,
            width: '100%',
            backgroundColor: 'divider',
            borderRadius: 1.5,
            minHeight: 60,
          }}>
          <InputBase fullWidth placeholder="What's in your mind?" />
        </Box>
      </Row>
      <Divider />
      <Row sx={{ p: 1, pr: 3 }}>
        <Box sx={{ flex: 1, button: { mr: 1.2 } }}>
          <Tooltip arrow title='Add Picture'>
            <IconButton size='small'>
              <IconPhotoPlus strokeWidth='1.4' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title='Add Emoji'>
            <IconButton size='small'>
              <IconMoodSmile strokeWidth='1.4' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title='Select relays'>
            <IconButton size='small'>
              <IconServerBolt strokeWidth='1.4' />
            </IconButton>
          </Tooltip>
        </Box>
        <Button variant='contained' size='small'>
          Post
        </Button>
      </Row>
    </PaperContainer>
  )
})

export default PostCreateForm
