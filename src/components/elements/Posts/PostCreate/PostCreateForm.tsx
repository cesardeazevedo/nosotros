import { Box, Button, IconButton, InputBase } from '@mui/material'
import { IconMoodSmile, IconPhotoPlus, IconServerBolt } from '@tabler/icons-react'
import ComingSoon from 'components/elements/Layouts/ComingSoon'
import { Row } from 'components/elements/Layouts/Flex'
import PaperContainer from 'components/elements/Layouts/PaperContainer'
import Tooltip from 'components/elements/Layouts/Tooltip'
import UserAvatar from 'components/elements/User/UserAvatar'
import { Observer } from 'mobx-react-lite'
import { authStore } from 'stores/ui/auth.store'

const PostCreateForm = function PostCreateForm() {
  return (
    <PaperContainer>
      <Row sx={{ position: 'relative', alignItems: 'flex-start', overflow: 'hidden' }}>
        <ComingSoon />
        <Box
          sx={{
            mx: 0,
            p: 1,
            px: 2,
            width: '100%',
          }}>
          <InputBase
            multiline
            fullWidth
            rows={2}
            placeholder="What's in your mind?"
            sx={{ fontSize: '115%', fontWeight: 500, }}
            startAdornment={
              <Box sx={{ mr: 2, alignSelf: 'flex-start' }}>
                <Observer>{() => <UserAvatar user={authStore.currentUser} size={34} />}</Observer>
              </Box>
            }
          />
          <Row>
            <Box sx={{ flex: 1, button: { mr: 1.2 } }}>
              <Tooltip arrow title='Add Picture'>
                <IconButton size='small'>
                  <IconPhotoPlus strokeWidth='1.4' size={22} />
                </IconButton>
              </Tooltip>
              <Tooltip arrow title='Add Emoji'>
                <IconButton size='small'>
                  <IconMoodSmile strokeWidth='1.4' size={22} />
                </IconButton>
              </Tooltip>
              <Tooltip arrow title='Select relays'>
                <IconButton size='small'>
                  <IconServerBolt strokeWidth='1.4' size={22} />
                </IconButton>
              </Tooltip>
            </Box>
            <Button variant='contained' size='small'>
              Post
            </Button>
          </Row>
        </Box>
      </Row >
    </PaperContainer >
  )
}

export default PostCreateForm
