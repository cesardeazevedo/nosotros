import { RelayTableHeader } from '@/components/elements/Relays/RelayTableHeader'
import { RelayTableRow } from '@/components/elements/Relays/RelayTableRow'
import { Stack } from '@/components/ui/Stack/Stack'
import { relaysStore } from '@/stores/relays/relays.store'
import { observer } from 'mobx-react-lite'
import { RelayDiscoveryRowLoading } from '../RelayDiscovery/RelayDiscoveryRowLoading'

export const RelayActiveList = observer(function RelayActiveList() {
  return (
    <Stack horizontal={false}>
      {relaysStore.connected.length === 0 && <RelayDiscoveryRowLoading />}
      <table cellPadding={1}>
        <RelayTableHeader renderLatencyColumn={false} />
        <tbody>
          {relaysStore.connected.map((relay) => {
            const info = relaysStore.getInfo(relay.url)
            return (
              <RelayTableRow
                key={relay.url}
                relay={relay.url}
                relayPubkey={info?.pubkey}
                authRequired={!!info?.limitation?.auth_required}
                paymentRequired={!!info?.limitation?.payment_required}
              />
            )
          })}
        </tbody>
      </table>
      <br />
    </Stack>
  )
})
