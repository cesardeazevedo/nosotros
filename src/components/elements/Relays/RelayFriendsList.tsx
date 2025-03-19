import { Text } from '@/components/ui/Text/Text'
import { useCurrentUser } from '@/hooks/useRootStore'
import { userRelayStore } from '@/stores/userRelays/userRelay.store'
import { observer } from 'mobx-react-lite'
import { useDeferredValue } from 'react'
import { UsersAvatars } from '../User/UsersAvatars'

type Props = {
  relay: string
}

export const RelayFriendsList = observer(function RelayFriendsList(props: Props) {
  const { relay } = props
  const user = useCurrentUser()
  const users = [...(userRelayStore.getPubkeysFromRelay(relay) || [])]
  const usersDeffered = useDeferredValue(users)
  const usersFollowings = usersDeffered.filter((pubkey) => user?.followsPubkey(pubkey))

  return (
    <UsersAvatars
      pubkeys={usersFollowings}
      description={
        <Text variant='title' size='sm'>
          {usersFollowings.length} people you follow joined {relay}
        </Text>
      }
    />
  )
})
