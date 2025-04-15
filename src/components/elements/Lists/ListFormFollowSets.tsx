import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Event } from '@/stores/events/event'
import { spacing } from '@/themes/spacing.stylex'
import type { Ref } from 'react'
import { useImperativeHandle, useState } from 'react'
import { css } from 'react-strict-dom'
import { Search } from '../../modules/Search/Search'
import { UserChip } from '../User/UserChip'
import type { RefListKind } from './ListForm'

export type Props = {
  event?: Event
  ref: Ref<RefListKind>
}

export const ListFormFollowsSets = (props: Props) => {
  const [, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>(props.event?.getTags('p') || [])

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
