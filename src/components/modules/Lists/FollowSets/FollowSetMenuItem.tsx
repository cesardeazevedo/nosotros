import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Text } from '@/components/ui/Text/Text'
import type { Event } from '@/stores/events/event'
import { palette } from '@/themes/palette.stylex'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { FollowSetLink } from './FollowSetLink'

type Props = {
  event: Event
  renderAvatars?: boolean
}

export const FollowSetMenuItem = observer(function FollowSetMenuItem(props: Props) {
  const { event, renderAvatars = false } = props
  const d = event.getTag('d')
  const pubkeys = event.getTags('p')
  const title = event.getTag('title')
  const description = event.getTag('description')
  return (
    <FollowSetLink event={event}>
      {({ isActive }) => (
        <ContentProvider value={{ disableLink: true, disablePopover: true }}>
          <MenuItem
            size='sm'
            selected={isActive}
            leadingIcon={<UserAvatar size='xs' pubkey={event.pubkey} />}
            trailingIcon={
              renderAvatars && (
                <ContentProvider value={{ disableLink: true }}>
                  <UsersAvatars
                    borderColor={isActive ? 'surfaceContainer' : 'surfaceContainerLowest'}
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
      )}
    </FollowSetLink>
  )
})

const styles = css.create({
  gray: {
    color: palette.onSurfaceVariant,
  },
})
