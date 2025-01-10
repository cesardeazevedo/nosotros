import { ListItem } from '@/components/ui/ListItem/ListItem'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { useCurrentUser } from '@/hooks/useRootStore'
import { useNostrClientContext } from '@/stores/context/nostr.context.hooks'
import type { NostrContext } from '@/stores/context/nostr.context.store'
import type { User } from '@/stores/users/user'
import { userStore } from '@/stores/users/users.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { forwardRef, useImperativeHandle } from 'react'
import { css, html } from 'react-strict-dom'
import { map, mergeMap, throttleTime, withLatestFrom } from 'rxjs'
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

export const SearchRelayUsers = observer(
  forwardRef<SearchRef, Props>(function SearchRelayUsers(props, ref) {
    const { query, limit = 10, onSelect } = props
    const context = useNostrClientContext()
    const user = useCurrentUser()

    const query$ = useObservable(pluckFirst, [query])
    const context$ = useObservable(pluckFirst, [context])

    const [users] = useObservableState<User[], NostrContext>(
      () =>
        query$.pipe(
          withLatestFrom(context$),
          throttleTime(1000, undefined, { trailing: true }),
          mergeMap(([query, context]) => context.client.search.subscribe(query, limit)),
          map((results) => results.sort((_, b) => (user?.following?.followsPubkey(b.pubkey) ? 1 : -1))),
          map((events) => events.map((x) => userStore.get(x.id)).filter((x) => !!x)),
        ),
      [],
    )

    useImperativeHandle(ref, () => ({ users }))

    return (
      <>
        {users.map((user, index) => (
          <ListItem
            interactive
            selected={props.selectedIndex === index}
            sx={styles.item}
            onClick={() => onSelect(user.pubkey)}
            key={user.pubkey}
            supportingText={user.meta.nip05}
            leadingIcon={<UserAvatar size='sm' pubkey={user.pubkey} />}>
            <UserName pubkey={user.pubkey} disableLink />
          </ListItem>
        ))}
        {!users.length && (
          <html.div style={styles.loading}>
            <Skeleton sx={styles.skeleton} />
          </html.div>
        )}
      </>
    )
  }),
)

const styles = css.create({
  item: {
    flex: 0,
    width: '100%',
  },
  loading: {
    paddingInline: spacing.padding1,
  },
  skeleton: {
    width: '100%',
    height: 30,
  },
})
