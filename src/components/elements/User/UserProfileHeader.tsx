import { addMediaErrorAtom, mediaErrorsAtom } from '@/atoms/media.atoms'
import { FollowButton } from '@/components/modules/Follows/FollowButton'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import { useUserState } from '@/hooks/state/useUser'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { IconAt, IconDotsVertical, IconMessageCircleFilled } from '@tabler/icons-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { ContentLink } from '../Content/Link/Link'
import { LinkBase } from '../Links/LinkBase'
import { UserAvatar } from './UserAvatar'
import { UserContentAbout } from './UserContentAbout'
import { UserFollowings } from './UserFollowings'
import { UserRelays } from './UserRelays'

type Props = {
  pubkey: string
}

export const UserProfileBanner = function UserProfileBanner(props: { src: string }) {
  const { src } = props
  const addError = useSetAtom(addMediaErrorAtom)
  return (
    <img
      src={getImgProxyUrl('feed_img', src)}
      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      onError={() => addError(src)}
    />
  )
}

export const UserProfileHeader = memo(function UserProfileHeader(props: Props) {
  const { pubkey } = props
  const user = useUserState(pubkey, { syncFollows: true })
  const currentPubkey = useCurrentPubkey()
  const doesFollowCurrentUser = user.followsTag(currentPubkey)
  const { banner, nip05 } = user?.metadata || {}
  const hasError = useAtomValue(mediaErrorsAtom).has(banner || '')
  return (
    <>
      <html.div style={styles.header}>
        {banner && banner.startsWith('http') && !hasError ? (
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
        <Stack sx={styles.center}>
          <Stack grow horizontal={false}>
            <Stack align='center'>
              <Text variant='headline' size='sm'>
                {user?.displayName}
              </Text>
              {doesFollowCurrentUser && (
                <Text sx={styles.followsYou} variant='label' size='md'>
                  Follows You
                </Text>
              )}
            </Stack>
            {nip05 && (
              <Stack>
                <IconAt size={14} />
                <Text variant='label' size='lg'>
                  {nip05.replace(/^_@/, '')}
                </Text>
              </Stack>
            )}
          </Stack>
          <Stack gap={1} horizontal={false} align='flex-end'>
            <UserFollowings pubkey={pubkey} />
            <UserRelays pubkey={pubkey} />
          </Stack>
        </Stack>
        <UserContentAbout pubkey={pubkey} />
        {user.metadata?.website && <ContentLink href={user.metadata.website}>{user.metadata.website}</ContentLink>}
        <Stack sx={styles.follow} gap={0.5}>
          <Popover
            placement='bottom-end'
            contentRenderer={() => (
              <MenuList surface='surfaceContainerLow'>
                <LinkBase search={{ compose_kind: Kind.PublicMessage, compose: true, pubkey }}>
                  <MenuItem interactive leadingIcon={<IconMessageCircleFilled />} label='Send Public Message' />
                </LinkBase>
              </MenuList>
            )}>
            {({ getProps, setRef, open }) => (
              <IconButton
                {...getProps()}
                ref={setRef}
                variant='outlined'
                onClick={() => open()}
                icon={<IconDotsVertical stroke='currentColor' strokeWidth='2.0' size={20} />}
              />
            )}
          </Popover>
          <FollowButton value={pubkey} />
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
    paddingInline: spacing.padding3,
    paddingTop: spacing.padding8,
    paddingBottom: spacing.padding3,
  },
  center: {
    paddingBlock: spacing.padding1,
  },
  follow: {
    position: 'absolute',
    right: 22,
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
  secondary: {
    color: palette.onSurfaceVariant,
  },
  underline: {
    cursor: 'pointer',
    textDecoration: {
      default: 'default',
      ':hover': 'underline',
    },
  },
  button: {
    paddingInlineStart: spacing.padding1,
    paddingInlineEnd: spacing.padding1,
  },
  followsYou: {
    marginLeft: 4,
    marginTop: 4,
    display: 'flex',
    verticalAlign: 'middle',
    color: palette.onSurfaceVariant,
    borderRadius: shape.lg,
    paddingBlock: 2,
    paddingInline: 6,
    backgroundColor: palette.surfaceContainerHigh,
  },
})
