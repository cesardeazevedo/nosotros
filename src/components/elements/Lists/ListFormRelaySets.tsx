import { Paper } from '@/components/ui/Paper/Paper'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Event } from '@/stores/events/event'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import type { Ref } from 'react'
import { useImperativeHandle, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { OnKeyDownRef } from '../../modules/Search/SearchContent'
import { SearchRelays } from '../../modules/Search/SearchRelays'
import { RelayChip } from '../Relays/RelayChip'
import type { RefListKind } from './ListForm'

type Props = {
  ref: Ref<RefListKind>
  event?: Event
}

export const ListFormRelaySet = observer(function ListFormRelaySet(props: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>(props.event?.getTags('relay') || [])

  const searchRef = useRef<OnKeyDownRef>(null)

  const add = (relay: string) => {
    if (selected.indexOf(relay) === -1) {
      setSelected((prev) => [...prev, relay])
      setQuery('')
    }
  }

  useImperativeHandle(props.ref, () => ({
    getTags: () => selected.map((x) => ['relay', x]),
  }))

  return (
    <>
      {selected?.length > 0 && (
        <Stack gap={0.5} wrap sx={styles.maxScroll}>
          {selected?.map((relay) => (
            <RelayChip
              key={relay}
              url={relay}
              onDelete={() => setSelected((prev) => prev.filter((x) => x !== relay))}
            />
          ))}
        </Stack>
      )}
      <Paper outlined surface='surfaceContainerLow'>
        <html.div style={styles.content}>
          <SearchField
            sx={styles.search}
            value={query}
            placeholder='Search relays (or enter wss://)'
            onKeyDown={(event) => searchRef.current?.onKeyDown({ event })}
            onChange={(e) => setQuery(e.target.value)}
          />
        </html.div>
        <html.div style={styles.maxScroll}>
          <SearchRelays ref={searchRef} query={query} limit={100} onSelect={(relay) => add(relay)} />
        </html.div>
      </Paper>
    </>
  )
})

const styles = css.create({
  content: {
    padding: spacing.padding1,
  },
  maxScroll: {
    position: 'relative',
    maxHeight: 350,
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
  search: {
    backgroundColor: palette.surfaceContainerHigh,
  },
})
