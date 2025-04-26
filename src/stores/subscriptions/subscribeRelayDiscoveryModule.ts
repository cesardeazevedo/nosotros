import { bufferTime, identity, mergeMap, tap } from 'rxjs'
import { eventStore } from '../events/event.store'
import type { RelayDiscoveryModule } from '../modules/relay.discovery.module'
import { relaysStore } from '../relays/relays.store'
import { subscribeFeedStore } from './subscribeFeedStore'

export function subscribeRelayDiscoveryModule(module: RelayDiscoveryModule) {
  return subscribeFeedStore(module.feed, { live: false }).pipe(
    mergeMap(identity),
    bufferTime(2500),
    mergeMap(identity),
    tap((event) => {
      module.add(event)
      const url = eventStore.get(event.id)?.getTag('d')
      if (url) {
        relaysStore.addInfoFromDiscovery(url, event)
      }
    }),
  )
}
