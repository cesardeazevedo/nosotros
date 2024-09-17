import type { Props as AvatarProps } from '@/components/ui/Avatar/Avatar'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import type { SxProps } from '@/components/ui/types'
import { css } from 'react-strict-dom'
import type User from 'stores/models/user'
import { settingsStore } from 'stores/ui/settings.store'
import LinkProfile from '../Links/LinkProfile'
import UserPopover from './UserPopover'

type Props = {
  user?: User
  sx?: SxProps
  size?: AvatarProps['size']
  disableLink?: boolean
  disabledPopover?: boolean
}

function UserAvatar(props: Props) {
  const { sx, user, size = 'md', disableLink = false, disabledPopover = false } = props
  const avatarProps = user?.meta?.picture
    ? { src: settingsStore.getImgProxyUrl('user_avatar', user.meta.picture) }
    : { src: '/placeholder.jpg' }
  return (
    <UserPopover user={user} disabled={disabledPopover}>
      <LinkProfile user={user} disableLink={disableLink}>
        <Avatar {...avatarProps} size={size} sx={[styles.avatar, sx]}>
          {user?.initials}
        </Avatar>
      </LinkProfile>
    </UserPopover>
  )
}

const styles = css.create({
  avatar: {
    cursor: 'pointer',
  },
})

export default UserAvatar
