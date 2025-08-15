import { ContentProvider } from '@/components/providers/ContentProvider'
import type { Props as AvatarProps } from '@/components/ui/Avatar/Avatar'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import type { SxProps } from '@/components/ui/types'
import { useRelayInfo } from '@/hooks/query/useRelayInfo'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { memo } from 'react'
import { UserAvatar } from '../User/UserAvatar'

type Props = {
  size?: AvatarProps['size']
  url: string
  onlyRelayIcon?: boolean
  sx?: SxProps
}

export const RelayIcon = memo(function RelayIcon(props: Props) {
  const { url, size = 'sm', onlyRelayIcon = false, sx } = props
  const { data: info } = useRelayInfo(url)
  return (
    <>
      {info?.icon ? (
        <Avatar size={size} src={getImgProxyUrl('user_avatar', info.icon)} sx={sx} />
      ) : info?.pubkey && !onlyRelayIcon ? (
        <ContentProvider value={{ disableLink: true, disablePopover: true }}>
          <UserAvatar size={size} pubkey={info?.pubkey} sx={sx} />
        </ContentProvider>
      ) : (
        <></>
      )}
    </>
  )
})
