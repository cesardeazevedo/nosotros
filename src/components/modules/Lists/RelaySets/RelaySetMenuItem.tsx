import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Text } from '@/components/ui/Text/Text'
import type { Event } from '@/stores/events/event'
import { observer } from 'mobx-react-lite'

type Props = {
  event: Event
  selected?: boolean
}

export const RelaySetMenuItem = observer(function RelaySetMenuItem(props: Props) {
  const { event, selected } = props
  const title = event.getTag('title')
  const description = event.getTag('description')
  const relays = event.getTags('relay')
  return (
    <ContentProvider value={{ disablePopover: true, disableLink: true }}>
      <MenuItem
        size='sm'
        selected={selected}
        leadingIcon={<UserAvatar size='xs' pubkey={event.pubkey} />}
        label={
          <>
            {title} <Text size='md'>({relays.length})</Text>
          </>
        }
        supportingText={description}
        onClick={() => {}}
      />
    </ContentProvider>
  )
})
