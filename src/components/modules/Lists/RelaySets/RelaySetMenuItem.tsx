import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTag, useEventTags } from '@/hooks/useEventUtils'
import { memo } from 'react'

type Props = {
  event: NostrEventDB
  selected?: boolean
}

export const RelaySetMenuItem = memo(function RelaySetMenuItem(props: Props) {
  const { event, selected } = props
  const title = useEventTag(event, 'title')
  const description = useEventTag(event, 'description')
  const relays = useEventTags(event, 'relay')
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
