import { ContentProvider } from '@/components/providers/ContentProvider'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { useFollowingUsers } from '@/hooks/useFollowingUsers'
import type { User } from '@/stores/users/user'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { forwardRef, useImperativeHandle, useMemo } from 'react'
import { css, html } from 'react-strict-dom'
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
        {users.length === 0 && (
          <html.div style={styles.loading$container}>
            <Skeleton sx={styles.loading} />
          </html.div>
        )}
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
  loading$container: {
    paddingInline: spacing.padding1,
  },
  loading: {
    borderRadius: shape.lg,
    height: 36,
  },
})
