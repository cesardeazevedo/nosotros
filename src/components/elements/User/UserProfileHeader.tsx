import { Box, Button, Typography } from '@mui/material'
import { IconDiscountCheckFilled } from '@tabler/icons-react'
import { useStore } from 'hooks/useStore'
import { observer } from 'mobx-react-lite'
import type { User } from 'stores/modules/user.store'
import { CenteredContainer } from '../Layouts/CenteredContainer'
import { Row } from '../Layouts/Flex'
import PaperContainer from '../Layouts/PaperContainer'
import UserAvatar from './UserAvatar'
import UserContentAbout from './UserContentAbout'

type Props = {
  user?: User
}

const UserProfileHeader = observer(function UserProfileHeader(props: Props) {
  const { user } = props
  const store = useStore()
  const { banner, nip05 } = user?.metadata || {}
  return (
    <CenteredContainer maxWidth='sm' sx={{ mt: 0, mb: 0, pt: 0, pb: 0 }}>
      <PaperContainer sx={{ mb: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <Box sx={{ overflow: 'hidden', height: 220, m: '0 auto', p: 0 }}>
          {banner && (
            <img
              key={store.settings.getImgProxyUrl('user_avatar', banner)}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              src={banner}
            />
          )}
        </Box>
        <Box sx={{ position: 'relative' }}>
          <Box
            component='span'
            sx={{ position: 'absolute', left: 24, top: -50, border: '4px solid white', borderRadius: 45 }}>
            <UserAvatar user={user} size={90} disableLink disabledPopover />
          </Box>
          <Box sx={{ pt: 7, pl: 4, pb: 2 }}>
            <Typography variant='h6'>
              <Row>
                {user?.displayName}
                {nip05 && <IconDiscountCheckFilled size={20} style={{ marginLeft: 8 }} />}
              </Row>
            </Typography>
            {nip05 && <Typography variant='subtitle2'>{nip05}</Typography>}
            <Box sx={{ mt: 1, pr: 2 }}>
              <UserContentAbout user={user} />
            </Box>
          </Box>
          <Button color='info' variant='contained' sx={{ position: 'absolute', right: 20, top: 20 }}>
            Follow
          </Button>
        </Box>
      </PaperContainer>
    </CenteredContainer>
  )
})

export default UserProfileHeader
