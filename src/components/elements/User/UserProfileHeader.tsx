import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { userStore } from '@/stores/users/users.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { UserAvatar } from './UserAvatar'
import { UserContentAbout } from './UserContentAbout'
import { UserFollowButton } from './UserFollowButton'

type Props = {
  pubkey: string
}

export const UserProfileHeader = observer(function UserProfileHeader(props: Props) {
  const { pubkey } = props
  const user = userStore.get(pubkey)
  const { banner, nip05 } = user?.meta || {}
  const globalSettings = useGlobalSettings()
  return (
    <>
      <html.div style={styles.header}>
        {banner && (
          <img
            key={globalSettings.getImgProxyUrl('user_avatar', banner)}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            src={banner}
          />
        )}
      </html.div>
      <Stack horizontal={false} gap={1} sx={styles.content}>
        <UserAvatar sx={styles.avatar} pubkey={pubkey} size='xl' disableLink disabledPopover />
        <Stack horizontal={false}>
          <Text variant='headline' size='sm'>
            {user?.displayName}
          </Text>
          {nip05 && (
            <Text variant='label' size='lg'>
              {nip05}
            </Text>
          )}
        </Stack>
        <UserContentAbout pubkey={pubkey} />
        <html.div style={styles.follow}>
          <UserFollowButton pubkey={pubkey} />
        </html.div>
      </Stack>
    </>
  )
})

const styles = css.create({
  root: {
    margin: 0,
    padding: 0,
  },
  paper: {},
  header: {
    overflow: 'hidden',
    height: 220,
    margin: '0 auto',
    padding: 0,
  },
  content: {
    position: 'relative',
    paddingInline: spacing.padding4,
    paddingTop: spacing.padding8,
    paddingBottom: spacing.padding2,
  },
  follow: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  avatar: {
    position: 'absolute',
    left: 24,
    top: -50,
    border: '4px solid white',
  },
})
