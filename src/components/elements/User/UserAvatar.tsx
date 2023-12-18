import { Avatar } from '@mui/material'
import { useStore } from 'stores'
import { User } from 'stores/modules/user.store'
import LinkProfile from '../Links/LinkProfile'
import UserPopover from './UserPopover'

type Props = {
  user?: User
  size?: number
  dense?: boolean
  disableLink?: boolean
  disabledPopover?: boolean
}

function UserAvatar(props: Props) {
  const { user, size: propSize, disableLink = false, disabledPopover = false, dense = false } = props
  const size = propSize || (dense ? 22 : 40)
  const store = useStore()
  const avatarProps = user?.picture
    ? { src: store.settings.getImgProxyUrl('140x,q90', user.picture) }
    : { src: '/placeholder.jpg' }
  return (
    <UserPopover user={user} disabled={disabledPopover}>
      <LinkProfile user={user} disabled={disableLink}>
        <Avatar {...avatarProps} sx={{ cursor: 'pointer', width: size, height: size }}>
          {user?.initial}
        </Avatar>
      </LinkProfile>
    </UserPopover>
  )
}

export default UserAvatar
