import { Chip } from '@/components/ui/Chip/Chip'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { UserRelayDB } from '@/nostr/nips/nip65.relaylist'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { RelayConnectedIcon } from './RelayConnectedIcon'

type Props = {
  userRelay: UserRelayDB
  avatar?: React.ReactNode
  onDelete?: () => void
}

export const RelayUserChip = observer(function RelayUserChip(props: Props) {
  const { avatar, userRelay, onDelete } = props
  const { relay: url } = userRelay
  const formatted = useMemo(() => new URL(url), [url])
  return (
    <Tooltip cursor='arrow' text={url}>
      <Chip icon={avatar || <RelayConnectedIcon url={url} />} label={<>{formatted.hostname}</>} onDelete={onDelete} />
    </Tooltip>
  )
})
