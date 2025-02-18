import type { Props as AvatarProps } from '@/components/ui/Avatar/Avatar'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import type { SxProps } from '@/components/ui/types'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { userStore } from '@/stores/users/users.store'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { LinkProfile } from '../Links/LinkProfile'
import { UserPopover } from './UserPopover'

export type Props = {
  pubkey?: string
  sx?: SxProps
  size?: AvatarProps['size']
}

export const UserAvatar = observer(function UserAvatar(props: Props) {
  const { sx, pubkey, size = 'md' } = props
  const globalSettings = useGlobalSettings()
  const user = userStore.get(pubkey)
  const avatarProps = user?.meta?.picture
    ? { src: globalSettings.getImgProxyUrl('user_avatar', user.meta.picture) }
    : { src: '/user.jpg' }
  const avatar = (
    <Avatar {...avatarProps} size={size} sx={[styles.avatar, sx]}>
      {user?.initials || pubkey || ''}
    </Avatar>
  )
  if (user?.meta?.picture && pubkey) {
    return (
      <UserPopover pubkey={pubkey}>
        <LinkProfile pubkey={pubkey}>{avatar}</LinkProfile>
      </UserPopover>
    )
  }
  return <>{avatar}</>
})

const styles = css.create({
  avatar: {
    cursor: 'pointer',
  },
})
