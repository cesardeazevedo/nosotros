import { Avatar } from '@mui/material'
import type User from 'stores/models/user'
import { settingsStore } from 'stores/ui/settings.store'
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
  const avatarProps = user?.meta?.picture
    ? { src: settingsStore.getImgProxyUrl('user_avatar', user.meta.picture) }
    : { src: '/placeholder.jpg' }
  return (
    <UserPopover user={user} disabled={disabledPopover}>
      <LinkProfile user={user} disableLink={disableLink}>
        <Avatar {...avatarProps} sx={{ cursor: 'pointer', width: size, height: size }}>
          {user?.initials}
        </Avatar>
      </LinkProfile>
    </UserPopover>
  )
}

export default UserAvatar
