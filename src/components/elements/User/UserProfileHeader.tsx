import { toggleQRCodeDialogAtom } from '@/atoms/dialog.atoms'
import { addMediaErrorAtom, mediaErrorsAtom } from '@/atoms/media.atoms'
import { enqueueToastAtom } from '@/atoms/toaster.atoms'
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
import { IconBoltFilled, IconCopy, IconDotsVertical, IconQrcode, IconSend } from '@tabler/icons-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo, useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import { ContentLink } from '../Content/Link/Link'
import { LinkBase } from '../Links/LinkBase'
import { UserAvatar } from './UserAvatar'
import { UserContentAbout } from './UserContentAbout'
import { UserFollowings } from './UserFollowings'
import { UserNIP05 } from './UserNIP05'
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
  const { banner, nip05, lud16 } = user?.metadata || {}
  const hasError = useAtomValue(mediaErrorsAtom).has(banner || '')
  const toggleQRCodeDialog = useSetAtom(toggleQRCodeDialogAtom)
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const handleCopy = useCallback((value: string | undefined) => {
    if (value) {
      const type = 'text/plain'
      const blob = new Blob([value], { type })
      window.navigator.clipboard.write([new ClipboardItem({ [type]: blob })]).then(() => {
        enqueueToast({ component: 'Copied', duration: 4000 })
      })
    }
  }, [])

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
            {nip05 && <UserNIP05 variant='label' size='lg' pubkey={pubkey} />}
            {lud16 && (
              <Stack>
                <IconBoltFilled size={12} strokeWidth='1.8' />
                {lud16}
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
            contentRenderer={({ close }) => (
              <MenuList surface='surfaceContainerLow'>
                <MenuItem
                  size='sm'
                  leadingIcon={<IconCopy size={18} />}
                  onClick={() => {
                    close()
                    handleCopy(user.nprofile)
                  }}
                  label='Copy User ID'
                />
                <MenuItem
                  size='sm'
                  leadingIcon={<IconQrcode size={18} />}
                  onClick={() => {
                    close()
                    toggleQRCodeDialog(pubkey)
                  }}
                  label='Show QR Code'
                />
                <Divider />
                <LinkBase search={{ compose_kind: Kind.PublicMessage, compose: true, pubkey }}>
                  <MenuItem size='sm' interactive leadingIcon={<IconSend size={18} />} label='Send Public Message' />
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
