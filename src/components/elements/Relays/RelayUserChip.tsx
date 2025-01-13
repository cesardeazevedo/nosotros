import { Chip } from '@/components/ui/Chip/Chip'
import type { UserRelay } from '@/nostr/helpers/parseRelayList'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { RelayConnectedIcon } from './RelayConnectedIcon'

type Props = {
  userRelay: UserRelay
  avatar?: React.ReactNode
  onDelete?: () => void
}

export const RelayUserChip = observer(function RelayUserChip(props: Props) {
  const { avatar, userRelay, onDelete } = props
  const { relay: url } = userRelay
  const formatted = useMemo(() => new URL(url), [url])
  return (
    <Chip icon={avatar || <RelayConnectedIcon url={url} />} label={<>{formatted.hostname}</>} onDelete={onDelete} />
  )
})
