import { RelayListRow } from '@/components/elements/Relays/RelayListRow'
import { RelayTableRow } from '@/components/elements/Relays/RelayTableRow'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTag } from '@/hooks/useEventUtils'
import { memo } from 'react'

type Props = {
  event: NostrEventDB
  table?: boolean
}

export const RelayMonitorRow = memo(function RelayMonitorRow(props: Props) {
  const { event, table = true } = props
  const dTag = useEventTag(event, 'd')
  const relayPubkey = useEventTag(event, 'p')
  const relay = formatRelayUrl(dTag || '')
  const hasAuthor = !!relayPubkey && relayPubkey.length === 64 // check for bad data
  const rtt = useEventTag(event, 'rtt-open')
  const RelayComponent = table ? RelayTableRow : RelayListRow
  return <RelayComponent url={relay} rtt={rtt} relay={relay} relayPubkey={hasAuthor ? relayPubkey : undefined} />
})
