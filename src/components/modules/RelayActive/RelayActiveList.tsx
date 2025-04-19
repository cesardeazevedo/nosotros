import { RelayListRow } from '@/components/elements/Relays/RelayListRow'
import { RelayListRowLoading } from '@/components/elements/Relays/RelayListRowLoading'
import { Stack } from '@/components/ui/Stack/Stack'
import { relaysStore } from '@/stores/relays/relays.store'
import { observer } from 'mobx-react-lite'

export const RelayActiveList = observer(function RelayActiveList() {
  return (
    <Stack horizontal={false}>
      {relaysStore.connected.length === 0 ? (
        <RelayListRowLoading />
      ) : (
        <>
          {relaysStore.connected.map((relay) => {
            const info = relaysStore.getInfo(relay.url)
            return (
              <RelayListRow
                key={relay.url}
                relay={relay.url}
                relayPubkey={info?.pubkey}
                authRequired={!!info?.limitation?.auth_required}
                paymentRequired={!!info?.limitation?.payment_required}
              />
            )
          })}
        </>
      )}
    </Stack>
  )
})
