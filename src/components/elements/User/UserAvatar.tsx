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
  fallback?: boolean
}

export const UserAvatar = observer(function UserAvatar(props: Props) {
  const { sx, pubkey, size = 'md', fallback = true } = props
  const globalSettings = useGlobalSettings()
  const user = userStore.get(pubkey)
  const avatarProps = user?.metadata?.picture
    ? { src: globalSettings.getImgProxyUrl('user_avatar', user.metadata.picture) }
    : { src: '/user.jpg' }
  const avatar = (
    <Avatar {...avatarProps} size={size} sx={[styles.avatar, sx]}>
      {fallback ? <Avatar src='/user.jpg' size={size} /> : pubkey?.[0]}
    </Avatar>
  )
  if (user?.metadata?.picture && pubkey) {
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
