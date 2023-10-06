import { Avatar } from '@mui/material'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Identicon } from '@nichoth/identicon'
import { sha256 } from '@noble/hashes/sha256'
import { useMemo } from 'react'
import { UserState } from 'stores/nostr/user.store'

type Props = {
  user?: UserState | null
  dense?: boolean
  size?: number
}

function UserAvatar(props: Props) {
  const { user, size: propSize, dense = false } = props
  const size = propSize || (dense ? 22 : 40)
  const identicon = useMemo(() => {
    if (!user?.picture) {
      return new Identicon(sha256(user?.nip05 || user?.name || '').toString())
    }
  }, [user])
  return (
    <>
      {!user?.picture && identicon && (
        <img src={`data:image/svg+xml;base64,${identicon}`} style={{ width: size, height: size, borderRadius: size }} />
      )}
      {user?.picture && (
        <Avatar src={user.picture} sx={{ cursor: 'pointer', width: size, height: size }}>
          {user.name?.[0]}
        </Avatar>
      )}
    </>
  )
}

export default UserAvatar
