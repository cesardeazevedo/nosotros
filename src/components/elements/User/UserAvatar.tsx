import type { Props as AvatarProps } from '@/components/ui/Avatar/Avatar'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import type { SxProps } from '@/components/ui/types'
import { useUserMetadata } from '@/hooks/state/useUser'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { LinkProfile } from '../Links/LinkProfile'
import { UserPopover } from './UserPopover'

export type Props = {
  pubkey: string
  sx?: SxProps
  size?: AvatarProps['size']
  fallback?: boolean
}

export const UserAvatar = memo(function UserAvatar(props: Props) {
  const { sx, pubkey, size = 'md', fallback = true } = props
  const user = useUserMetadata(pubkey)
  const avatarProps = user?.metadata?.picture
    ? { src: getImgProxyUrl('user_avatar', user.metadata.picture) }
    : { src: '/user.jpg' }
  const avatar = (
    <LinkProfile pubkey={pubkey}>
      <Avatar {...avatarProps} size={size} sx={[styles.avatar, sx]}>
        {fallback ? <Avatar src='/user.jpg' size={size} /> : pubkey?.[0]}
      </Avatar>
    </LinkProfile>
  )
  if (user?.metadata?.picture && pubkey) {
    return <UserPopover pubkey={pubkey}>{avatar}</UserPopover>
  }
  return <>{avatar}</>
})

const styles = css.create({
  avatar: {
    cursor: 'pointer',
  },
})
