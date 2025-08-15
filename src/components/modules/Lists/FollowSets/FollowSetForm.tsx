import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTags } from '@/hooks/useEventUtils'
import { spacing } from '@/themes/spacing.stylex'
import type { Ref } from 'react'
import { useImperativeHandle, useState } from 'react'
import { css } from 'react-strict-dom'
import { UserChip } from '../../../elements/User/UserChip'
import { Search } from '../../Search/Search'
import type { RefListKind } from '../ListForm'

export type Props = {
  event?: NostrEventDB
  ref: Ref<RefListKind>
}

export const FollowSetForm = (props: Props) => {
  const [, setQuery] = useState('')

  const profiles = useEventTags(props.event, 'p')
  const [selected, setSelected] = useState<string[]>(profiles)

  const add = (pubkey: string) => {
    if (selected.indexOf(pubkey) === -1) {
      setSelected((prev) => [...prev, pubkey])
    }
    setQuery('')
  }

  useImperativeHandle(props.ref, () => ({
    getTags: () => selected.map((x) => ['p', x]),
  }))

  return (
    <>
      {selected.length > 0 && (
        <Stack gap={0.5} wrap sx={styles.maxScroll}>
          {selected.map((pubkey) => (
            <UserChip
              key={pubkey}
              pubkey={pubkey}
              onDelete={() => setSelected((prev) => prev.filter((x) => x !== pubkey))}
            />
          ))}
        </Stack>
      )}
      <Stack horizontal={false} gap={1}>
        <Paper surface='surfaceContainerLow' outlined>
          <Search
            suggestQuery={false}
            suggestRelays={false}
            sx={styles.maxScroll}
            limit={50}
            placeholder='Search Users (npub, nprofile or hex)'
            onSelect={(item) => {
              switch (item.type) {
                case 'user':
                case 'user_relay': {
                  add(item.pubkey)
                  break
                }
              }
            }}
          />
        </Paper>
      </Stack>
    </>
  )
}

const styles = css.create({
  content: {
    padding: spacing.padding1,
  },
  maxScroll: {
    maxHeight: 300,
    overflowY: 'scroll',
  },
})
