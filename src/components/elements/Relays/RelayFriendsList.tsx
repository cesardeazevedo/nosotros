import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import { useCurrentUser } from '@/hooks/useRootStore'
import { eventStore } from '@/stores/events/event.store'
import { observer } from 'mobx-react-lite'
import { useDeferredValue } from 'react'
import { UsersAvatars } from '../User/UsersAvatars'

type Props = {
  relay: string
}

export const RelayFriendsList = observer(function RelayFriendsList(props: Props) {
  const { relay } = props
  const user = useCurrentUser()
  const users = [...(eventStore.getPubkeysByKindTagValue(Kind.RelayList, 'r', relay) || [])]
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
