import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Text } from '@/components/ui/Text/Text'
import type { Event } from '@/stores/events/event'
import { observer } from 'mobx-react-lite'
import { RelaySetLink } from './RelaySetLink'

type Props = {
  event: Event
}

export const ListRelaySetMenuItem = observer(function ListRelaySetMenuItem(props: Props) {
  const { event } = props
  const title = event.getTag('title')
  const description = event.getTag('description')
  const relays = event.getTags('relay')
  return (
    <RelaySetLink event={event}>
      {({ isActive }) => (
        <MenuItem
          size='sm'
          selected={isActive}
          leadingIcon={<UserAvatar size='xs' pubkey={event.pubkey} />}
          label={
            <>
              {title} <Text size='md'>({relays.length})</Text>
            </>
          }
          supportingText={description}
          onClick={() => {}}
        />
      )}
    </RelaySetLink>
  )
})
