import { Stack } from '@/components/ui/Stack/Stack'
import { relaysStore } from '@/stores/relays/relays.store'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { RelayChip } from '../Relays/RelayChip'
import { useObservableState } from 'observable-hooks'
import type { RelayStore } from '@/stores/relays/relay'
import { db } from '@/nostr/db'
import { from, identity, map, mergeMap } from 'rxjs'

type Props = {
  query: string
  selectedIndex?: number
  onSelect: (relay: string) => void
}

export const SearchRelays = observer(function SearchRelays(props: Props) {
  const { query, onSelect } = props
  useObservableState<RelayStore>(() => {
    return from(db.relayStats.queryAll()).pipe(
      mergeMap(identity),
      map((stat) => relaysStore.add(stat.url, stat)),
    )
  })
  const relays = relaysStore.list

  const filteredRelays = useMemo(() => relays.filter((relay) => relay.url.indexOf(query) > -1), [query])
  return (
    <Stack horizontal={false} gap={0.5} align='flex-start'>
      {filteredRelays.map((relay) => (
        <RelayChip key={relay.url} url={relay.url} onClick={() => onSelect(relay.url)} />
      ))}
    </Stack>
  )
})
