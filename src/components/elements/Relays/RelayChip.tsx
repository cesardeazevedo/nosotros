import { Chip } from '@/components/ui/Chip/Chip'
import type { Relay } from 'core/Relay'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import RelayIcon from './RelayIcon'

type Props = {
  relay: Relay
}

const RelayChip = observer(function RelayChip(props: Props) {
  const { relay } = props
  const formatted = useMemo(() => new URL(relay.url), [relay])
  return <Chip icon={<RelayIcon url={relay.url} />} label={formatted.hostname} />
})

export default RelayChip
