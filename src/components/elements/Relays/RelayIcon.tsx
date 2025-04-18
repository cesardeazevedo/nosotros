import type { Props as AvatarProps } from '@/components/ui/Avatar/Avatar'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import type { SxProps } from '@/components/ui/types'
import { relaysStore } from '@/stores/relays/relays.store'
import { observer } from 'mobx-react-lite'
import { UserAvatar } from '../User/UserAvatar'
import { ContentProvider } from '@/components/providers/ContentProvider'

type Props = {
  size?: AvatarProps['size']
  url?: string
  onlyRelayIcon?: boolean
  sx?: SxProps
}

export const RelayIcon = observer(function RelayIcon(props: Props) {
  const { url, size = 'sm', onlyRelayIcon = false, sx } = props
  const info = relaysStore.getInfo(url)
  return (
    <>
      {info?.icon ? (
        <Avatar size={size} src={info?.icon} sx={sx} />
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
