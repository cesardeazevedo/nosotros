import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as AvatarProps } from '@/components/ui/Avatar/Avatar'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import type { SxProps } from '@/components/ui/types'
import { useUserState } from '@/hooks/state/useUser'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { LinkProfile } from '../Links/LinkProfile'
import { UserPopover } from './UserPopover'

export type Props = {
  pubkey: string
  sx?: SxProps
  size?: AvatarProps['size']
  onClick?: (src: string) => void
  fallback?: boolean
}

export const UserAvatar = memo(function UserAvatar(props: Props) {
  const { sx, pubkey, size = 'md', fallback = true, onClick } = props
  const { disableLink } = useContentContext()
  const user = useUserState(pubkey)
  const avatarProps = user?.metadata?.picture
    ? { src: getImgProxyUrl('user_avatar', user.metadata.picture) }
    : { src: '/user.jpg' }
  const avatar = (
    <Avatar
      {...avatarProps}
      size={size}
      sx={[styles.avatar, sx]}
      onClick={() => onClick?.(user.metadata?.picture || '')}>
      {fallback ? <Avatar src='/user.jpg' size={size} /> : pubkey?.[0]}
    </Avatar>
  )
  const avatarWithLink = disableLink ? avatar : <LinkProfile pubkey={pubkey}>{avatar}</LinkProfile>
  if (user?.metadata?.picture && pubkey) {
    return <UserPopover pubkey={pubkey}>{avatarWithLink}</UserPopover>
  }
  return <>{avatarWithLink}</>
})

const styles = css.create({
  avatar: {
    cursor: 'pointer',
  },
})
