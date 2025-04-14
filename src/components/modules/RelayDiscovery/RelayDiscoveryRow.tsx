import { RelayListRow } from '@/components/elements/Relays/RelayListRow'
import { RelayTableRow } from '@/components/elements/Relays/RelayTableRow'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { NostrEventMetadata } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { observer } from 'mobx-react-lite'

type Props = {
  event: NostrEventMetadata
  table?: boolean
}

export const RelayDiscoveryRow = observer(function RelayDiscoveryRow(props: Props) {
  const { event, table = true } = props
  const tags = event[metadataSymbol].tags || {}
  const relay = formatRelayUrl(tags?.d?.[0][1] || '')
  const relayPubkey = tags.p?.[0][1]
  const hasAuthor = !!relayPubkey && relayPubkey.length === 64 // check for bad data
  const rtt = tags['rtt-open']?.[0][1]
  const authRequired = tags.R?.flat().find((x) => x === 'auth') || false
  const paymentRequired = tags.R?.flat().find((x) => x === 'payment') || false
  const RelayComponent = table ? RelayTableRow : RelayListRow
  return (
    <RelayComponent
      rtt={rtt}
      relay={relay}
      relayPubkey={hasAuthor ? relayPubkey : undefined}
      authRequired={!!authRequired}
      paymentRequired={!!paymentRequired}
    />
  )
})
