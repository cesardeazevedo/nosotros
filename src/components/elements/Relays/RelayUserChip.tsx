import { Chip } from '@/components/ui/Chip/Chip'
import type { UserRelayDB } from 'db/types'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import RelayIcon from './RelayIcon'

type Props = {
  userRelay: UserRelayDB
}

const RelayUserChip = observer(function RelayUserChip(props: Props) {
  const { userRelay } = props
  const { type, relay: url } = userRelay
  const formatted = useMemo(() => new URL(url), [url])
  return <Chip icon={<RelayIcon url={url} />} label={`${formatted.hostname} (${type.toUpperCase()})`} />
})

export default RelayUserChip
