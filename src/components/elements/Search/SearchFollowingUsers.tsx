import { ContentProvider } from '@/components/providers/ContentProvider'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { useCurrentUser } from '@/hooks/useRootStore'
import { useObservableNostrContext } from '@/stores/context/nostr.context.hooks'
import type { User } from '@/stores/users/user'
import { userStore } from '@/stores/users/users.store'
import { observer } from 'mobx-react-lite'
import { useObservableState } from 'observable-hooks'
import { forwardRef, useImperativeHandle, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { filter, from, map, mergeMap, toArray } from 'rxjs'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'

type Props = {
  query: string
  selectedIndex?: number
  limit?: number
  onSelect: (pubkey: string) => void
}

type SearchRef = {
  users: User[]
}

export const SearchFollowingUsers = observer(
  forwardRef<SearchRef, Props>(function SearchFollowingUsers(props, ref) {
    const { query, limit = 10, onSelect } = props
    const user = useCurrentUser()

    // Get all following users
    const sub = useObservableNostrContext((context) => {
      return from(user?.following?.tags.get('p') || []).pipe(
        mergeMap((pubkey) => context.client.users.subscribe(pubkey)),
        map((event) => userStore.get(event.pubkey)),
        filter((x) => !!x),
        toArray(),
      )
    })
    const [usersData] = useObservableState(() => sub, [])

    const users = useMemo(() => {
      let result = usersData as User[]
      if (query) {
        result = usersData.filter((user) => user?.event.content.toLowerCase().indexOf(query.toLowerCase()) !== -1)
      }
      return result.slice(0, limit).map((x) => x)
    }, [query, usersData, limit])

    useImperativeHandle(ref, () => ({ users }))

    return (
      <ContentProvider value={{ disableLink: true }}>
        {users?.map((user, index) => (
          <ListItem
            interactive
            key={user.pubkey}
            sx={styles.item}
            selected={props.selectedIndex === index}
            onClick={() => onSelect(user.pubkey)}
            leadingIcon={<UserAvatar size='sm' pubkey={user.pubkey} />}>
            <UserName pubkey={user.pubkey} />
          </ListItem>
        ))}
      </ContentProvider>
    )
  }),
)

const styles = css.create({
  item: {
    flex: 0,
    width: '100%',
  },
})
