import { listItemTokens } from '@/components/ui/ListItem/ListItem.stylex'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { db } from '@/nostr/db'
import type { RelayStore } from '@/stores/relays/relay'
import { relaysStore } from '@/stores/relays/relays.store'
import { palette } from '@/themes/palette.stylex'
import { IconCoinBitcoin, IconLock } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useObservableState } from 'observable-hooks'
import type { Ref } from 'react'
import { useImperativeHandle, useMemo, useState } from 'react'
import { css } from 'react-strict-dom'
import { from, identity, map, mergeMap } from 'rxjs'
import type { OnKeyDownRef } from './SearchContent'
import { RelayIcon } from '../../elements/Relays/RelayIcon'

type Props = {
  sx?: SxProps
  query: string
  limit?: number
  ref: Ref<OnKeyDownRef | null>
  onEnterKey?: () => void
  initialSelected?: number
  onSelect: (relay: string) => void
}

export const SearchRelays = observer(function SearchRelays(props: Props) {
  const { query, limit = 10, onSelect, sx, ref, onEnterKey, initialSelected = -1 } = props
  const [selectedIndex, setSelectedIndex] = useState(initialSelected)

  useObservableState<RelayStore>(() => {
    return from(db.relayInfo.queryAll()).pipe(
      mergeMap(identity),
      map((info) => relaysStore.addInfo(info)),
    )
  })
  const relays = relaysStore.list

  const filteredRelays = useMemo(
    () => relays.filter((relay) => relay.url.toLowerCase().indexOf(query.toLowerCase()) > -1),
    [query],
  )

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: { key: string } }) => {
      switch (event.key) {
        case 'ArrowUp': {
          setSelectedIndex((prev) => (prev + limit - 1) % limit)
          return true
        }
        case 'ArrowDown': {
          setSelectedIndex((prev) => (prev + 1) % limit)
          return true
        }
        case 'Enter': {
          if (selectedIndex > 0) {
            const relay = filteredRelays[selectedIndex]
            if (relay) {
              onSelect(relay.url)
              return true
            }
          }
          onEnterKey?.()
          return false
        }
        default: {
          return false
        }
      }
    },
  }))

  return (
    <Stack horizontal={false} gap={1} sx={sx}>
      {filteredRelays.slice(0, limit).map((relay, index) => (
        <MenuItem
          key={relay.url}
          sx={styles.item}
          selected={index === selectedIndex}
          label={
            <Stack gap={0.5}>
              {relay.info?.name || relay.pretty}
              <Stack>
                {relay.info?.limitation?.auth_required && <IconLock size={18} />}
                {relay.info?.limitation?.payment_required && <IconCoinBitcoin size={18} />}
              </Stack>
            </Stack>
          }
          leadingIcon={<RelayIcon url={relay.url} />}
          supportingText={
            <Stack horizontal={false}>
              <Text size='md'>{relay.pretty}</Text>
              {relay.info?.description}
            </Stack>
          }
          onClick={() => onSelect(relay.url)}
        />
      ))}
    </Stack>
  )
})

const styles = css.create({
  item: {
    flex: 1,
    [listItemTokens.containerMinHeight]: 50,
    [listItemTokens.selectedContainerColor]: palette.surfaceContainerHighest,
  },
})
