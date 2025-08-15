import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTag, useEventTags } from '@/hooks/useEventUtils'
import { palette } from '@/themes/palette.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  event: NostrEventDB
  selected?: boolean
  renderAvatars?: boolean
}

export const FollowSetMenuItem = memo(function FollowSetMenuItem(props: Props) {
  const { event, selected, renderAvatars = false } = props
  const d = useEventTags(event, 'd')
  const pubkeys = useEventTags(event, 'p')
  const title = useEventTag(event, 'title')
  const description = useEventTag(event, 'description')
  return (
    <ContentProvider value={{ disableLink: true, disablePopover: true }}>
      <MenuItem
        size='sm'
        selected={selected}
        leadingIcon={<UserAvatar size='xs' pubkey={event.pubkey} />}
        trailingIcon={
          renderAvatars && (
            <ContentProvider value={{ disableLink: true }}>
              <UsersAvatars
                borderColor={selected ? 'surfaceContainer' : 'surfaceContainerLowest'}
                pubkeys={pubkeys}
                description={
                  <Text size='lg'>
                    {title} <Text sx={styles.gray}>({pubkeys.length})</Text>
                  </Text>
                }
              />
            </ContentProvider>
          )
        }
        label={
          <>
            {title?.slice(0, 20) || <html.span style={styles.gray}>#{d?.slice(0, 20)}</html.span>}{' '}
            <Text size='md' sx={styles.gray}>
              ({pubkeys.length || 'empty'})
            </Text>
          </>
        }
        supportingText={description}
        onClick={() => {}}
      />
    </ContentProvider>
  )
})

const styles = css.create({
  gray: {
    color: palette.onSurfaceVariant,
  },
})
