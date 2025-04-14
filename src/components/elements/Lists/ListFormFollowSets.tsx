import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import type { Ref } from 'react'
import { useImperativeHandle, useState } from 'react'
import { css } from 'react-strict-dom'
import { Search } from '../../modules/Search/Search'
import { UserChip } from '../User/UserChip'
import type { RefListKind } from './ListForm'

export type Props = {
  ref: Ref<RefListKind>
}

export const ListFormFollowsSets = (props: Props) => {
  const [, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])

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
        <Paper outlined sx={styles.content}>
          <Stack gap={0.5} wrap sx={styles.maxScroll}>
            {selected.map((pubkey) => (
              <UserChip
                key={pubkey}
                pubkey={pubkey}
                onDelete={() => setSelected((prev) => prev.filter((x) => x !== pubkey))}
              />
            ))}
          </Stack>
        </Paper>
      )}
      <Stack horizontal={false} gap={1}>
        <Paper surface='surfaceContainerLow' outlined>
          <Search
            sx={styles.maxScroll}
            limit={50}
            placeholder='Search Users (npub, nprofile or hex)'
            // onEnterKey={() => {
            //   if (query.length === 64) {
            //     add(query)
            //   } else {
            //     const decoded = decodeNIP19(query)
            //     switch (decoded?.type) {
            //       case 'npub': {
            //         add(decoded.data)
            //         break
            //       }
            //       case 'nprofile': {
            //         add(decoded.data.pubkey)
            //         break
            //       }
            //     }
            //   }
            // }}
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
