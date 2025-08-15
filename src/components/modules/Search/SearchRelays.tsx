import { RelayDescription } from '@/components/elements/Relays/RelayDescription'
import { listItemTokens } from '@/components/ui/ListItem/ListItem.stylex'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { prettyRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { RelayInfoDB } from '@/db/types'
import { palette } from '@/themes/palette.stylex'
import { IconCoinBitcoin, IconLock } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import type { Ref } from 'react'
import { memo, useImperativeHandle, useMemo, useState } from 'react'
import { css } from 'react-strict-dom'
import { RelayIcon } from '../../elements/Relays/RelayIcon'
import type { OnKeyDownRef } from './SearchContent'

type Props = {
  sx?: SxProps
  query: string
  limit?: number
  ref: Ref<OnKeyDownRef | null>
  onEnterKey?: () => void
  initialSelected?: number
  onSelect: (relay: string) => void
}

export const SearchRelays = memo(function SearchRelays(props: Props) {
  const { query, limit = 10, onSelect, sx, ref, onEnterKey, initialSelected = -1 } = props
  const [selectedIndex, setSelectedIndex] = useState(initialSelected)

  const queryClient = useQueryClient()
  const relays = useMemo(() => {
    return queryClient
      .getQueriesData<RelayInfoDB>({
        predicate: (e) => e.queryKey[0] === 'relayInfo',
      })
      .map(([, data]) => data)
      .filter((x) => !!x)
  }, [])
  console.log(relays)

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
      {filteredRelays.slice(0, limit).map((relay, index) => {
        const prettyName = prettyRelayUrl(relay.url)
        return (
          <MenuItem
            key={relay.url}
            sx={styles.item}
            selected={index === selectedIndex}
            label={
              <Stack gap={0.5}>
                {prettyName}
                <Stack>
                  {relay.limitation?.auth_required && <IconLock size={18} />}
                  {relay.limitation?.payment_required && <IconCoinBitcoin size={18} />}
                </Stack>
              </Stack>
            }
            leadingIcon={<RelayIcon url={relay.url} />}
            supportingText={
              <Stack horizontal={false}>
                <Text size='md'>{prettyName}</Text>
                <RelayDescription description={relay.description} />
              </Stack>
            }
            onClick={() => onSelect(relay.url)}
          />
        )
      })}
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
