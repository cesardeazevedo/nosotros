import { Text } from '@/components/ui/Text/Text'
import { useRelayUsers } from '@/hooks/query/useQueryUser'
import { memo } from 'react'
import { UsersAvatars } from '../User/UsersAvatars'

type Props = {
  url: string
}

export const RelayFriendsList = memo(function RelayFriendsList(props: Props) {
  const { url: relay } = props
  const { data: pubkeys = [] } = useRelayUsers(relay)

  if (!pubkeys.length) {
    return <></>
  }

  return (
    <UsersAvatars
      pubkeys={pubkeys}
      description={
        <Text variant='title' size='sm'>
          {pubkeys.length} people you follow joined {relay}
        </Text>
      }
    />
  )
})
