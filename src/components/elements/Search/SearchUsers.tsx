import { Chip } from '@/components/ui/Chip/Chip'
import type { Props as PaperProps } from '@/components/ui/Paper/Paper'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useCurrentUser } from '@/hooks/useRootStore'
import type { User } from '@/stores/users/user'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { css } from 'react-strict-dom'
import { SearchFollowingUsers } from './SearchFollowingUsers'
import { SearchRelayUsers } from './SearchRelayUsers'

export type SearchType = 'following' | 'nip50'

export type SearchUsersRef = {
  onKeyDown: (props: { event: { key: string } }) => boolean
}

export type Props = {
  query: string
  limit?: number
  dense?: boolean
  onSelect?: (props: { pubkey: string }) => void
} & Omit<PaperProps, 'children'>

export const SearchUsers = observer(
  forwardRef<SearchUsersRef, Props>(function SearchUsers(props, ref) {
    const user = useCurrentUser()
    const { query = '', limit = 10, dense = false, onSelect } = props
    const [searchType, setSearchType] = useState<SearchType>(user ? 'following' : 'nip50')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const searchRef = useRef<{ users: User[] } | null>(null)

    const handleKeyUp = useCallback(() => {
      setSelectedIndex((prev) => (prev + limit - 1) % limit)
    }, [])

    const handleKeyDown = useCallback(() => {
      setSelectedIndex((prev) => (prev + 1) % limit)
    }, [])

    const handleSearchTypeChange = useCallback((searchType: SearchType) => {
      return () => {
        setSelectedIndex(0)
        setSearchType(searchType)
      }
    }, [])

    const handleSelect = useCallback(
      (pubkey: string) => {
        onSelect?.({ pubkey })
      },
      [props, searchRef],
    )

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: { key: string } }) => {
        switch (event.key) {
          case 'ArrowUp': {
            handleKeyUp()
            return true
          }
          case 'ArrowDown': {
            handleKeyDown()
            return true
          }
          case 'Enter': {
            const user = searchRef.current?.users[selectedIndex]
            if (user) {
              handleSelect(user.pubkey)
              return true
            }
            return false
          }
          default: {
            return false
          }
        }
      },
    }))

    return (
      <Paper surface='surfaceContainerLow' elevation={4} {...props} sx={[styles.root, props.sx]}>
        <Stack sx={styles.header} gap={0.5}>
          <Tooltip text='Search for users that you follow'>
            <Chip
              variant='filter'
              label='Following'
              selected={searchType === 'following'}
              onClick={handleSearchTypeChange('following')}
            />
          </Tooltip>
          <Tooltip text='Search for users on relays (NIP50)'>
            <Chip
              selected={searchType === 'nip50'}
              variant='filter'
              label='Relay Search'
              onClick={handleSearchTypeChange('nip50')}
            />
          </Tooltip>
        </Stack>
        <Stack horizontal={false} sx={[styles.scroller, dense && styles.scroller$dense]}>
          {searchType === 'following' ? (
            <SearchFollowingUsers
              ref={searchRef}
              query={query}
              limit={limit}
              selectedIndex={selectedIndex}
              onSelect={handleSelect}
            />
          ) : (
            <SearchRelayUsers
              ref={searchRef}
              query={query}
              limit={limit}
              selectedIndex={selectedIndex}
              onSelect={handleSelect}
            />
          )}
        </Stack>
      </Paper>
    )
  }),
)

const styles = css.create({
  root: {
    height: '100%',
    minWidth: 220,
    paddingBlock: spacing.padding1,
  },
  scroller: {
    height: '100%',
    overflowY: 'auto',
  },
  scroller$dense: {
    maxHeight: 360,
  },
  header: {
    padding: spacing.padding1,
  },
})
