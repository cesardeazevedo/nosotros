import { Paper } from '@/components/ui/Paper/Paper'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTags } from '@/hooks/useEventUtils'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { Ref } from 'react'
import { memo, useImperativeHandle, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { RelayChip } from '../../../elements/Relays/RelayChip'
import type { OnKeyDownRef } from '../../Search/SearchContent'
import { SearchRelays } from '../../Search/SearchRelays'
import type { RefListKind } from '../ListForm'

type Props = {
  ref: Ref<RefListKind>
  event?: NostrEventDB
}

export const RelaySetForm = memo(function RelaySetForm(props: Props) {
  const [query, setQuery] = useState('')
  const relays = useEventTags(props.event, 'relays') || []
  const [selected, setSelected] = useState<string[]>(relays)

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
