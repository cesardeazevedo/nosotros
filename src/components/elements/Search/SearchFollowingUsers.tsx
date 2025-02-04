import { ContentProvider } from '@/components/providers/ContentProvider'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { useFollowingUsers } from '@/hooks/useFollowingUsers'
import type { User } from '@/stores/users/user'
import { observer } from 'mobx-react-lite'
import { forwardRef, useImperativeHandle, useMemo } from 'react'
import { css } from 'react-strict-dom'
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
    const usersData = useFollowingUsers()

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
