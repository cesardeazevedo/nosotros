import { Box, Button, Typography } from '@mui/material'
import { IconDiscountCheckFilled } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useStore } from 'stores'
import { UserState } from 'stores/nostr/user.store'
import { CenteredContainer } from '../Layouts/CenteredContainer'
import { Row } from '../Layouts/Flex'
import PaperContainer from '../Layouts/PaperContainer'
import TextContent from '../Texts/TextContent'
import UserAvatar from './UserAvatar'

type Props = {
  user?: UserState
}

const UserProfileHeader = observer(function UserProfileHeader(props: Props) {
  const { user } = props
  const store = useStore()
  return (
    <CenteredContainer maxWidth='sm' sx={{ mt: 0, mb: 0, pt: 0, pb: 0 }}>
      <PaperContainer sx={{ mb: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <Box sx={{ overflow: 'hidden', height: 220, m: '0 auto', p: 0 }}>
          {user?.banner && (
            <img key={user.banner} style={{ objectFit: 'cover', width: '100%', height: '100%' }} src={user.banner} />
          )}
        </Box>
        <Box sx={{ position: 'relative' }}>
          <Box
            component='span'
            sx={{ position: 'absolute', left: 24, top: -50, border: '4px solid white', borderRadius: 45 }}>
            <UserAvatar user={user} size={90} />
          </Box>
          <Box sx={{ pt: 7, pl: 4, pb: 2 }}>
            <Typography variant='h6'>
              <Row>
                {user?.displayName || user?.name}
                {user?.nip05 && <IconDiscountCheckFilled size={20} style={{ marginLeft: 8 }} />}
              </Row>
            </Typography>
            {user?.nip05 && <Typography variant='subtitle2'>{user?.nip05}</Typography>}
            <Box sx={{ mt: 1, pr: 2 }}>
              {store.users.getContentById(user?.id).map((token, index) => (
                <TextContent dense key={token.kind + token.content.toString() + index} token={token} />
              ))}
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
