import { ContentProvider } from '@/components/providers/ContentProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { mediaStore } from '@/stores/media/media.store'
import { userStore } from '@/stores/users/users.store'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { UserAvatar } from './UserAvatar'
import { UserContentAbout } from './UserContentAbout'
import { UserRelays } from './UserRelays'
import { FollowButton } from '@/components/modules/Follows/FollowButton'

type Props = {
  pubkey: string
}

export const UserProfileBanner = observer(function UserProfileBanner(props: { src: string }) {
  const { src } = props
  const globalSettings = useGlobalSettings()
  return (
    <img
      key={globalSettings.getImgProxyUrl('user_avatar', src)}
      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      src={src}
      onError={() => mediaStore.addError(src)}
    />
  )
})

export const UserProfileHeader = observer(function UserProfileHeader(props: Props) {
  const { pubkey } = props
  const user = userStore.get(pubkey)
  const { banner, nip05 } = user?.metadata || {}
  return (
    <>
      <html.div style={styles.header}>
        {banner && banner.startsWith('http') && !mediaStore.hasError(banner) ? (
          <UserProfileBanner src={banner} />
        ) : (
          <html.div style={styles.bannerFallback} />
        )}
      </html.div>
      <Divider />
      <Stack horizontal={false} gap={1} sx={styles.content}>
        <ContentProvider value={{ disableLink: true, disablePopover: true }}>
          <UserAvatar sx={styles.avatar} pubkey={pubkey} size='xl' />
        </ContentProvider>
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
        <Stack sx={styles.follow} gap={0.5}>
          <UserRelays pubkey={pubkey} />
          <FollowButton pubkey={pubkey} />
        </Stack>
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
    width: '100%',
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
  bannerFallback: {
    backgroundColor: palette.surfaceContainerLow,
    height: '100%',
  },
})
