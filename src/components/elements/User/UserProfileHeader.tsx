import { openImageDialogAtom, toggleQRCodeDialogAtom } from '@/atoms/dialog.atoms'
import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { FollowButton } from '@/components/modules/Follows/FollowButton'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { Kind } from '@/constants/kinds'
import { useUserState } from '@/hooks/state/useUser'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { sanitizeUrl } from '@braintree/sanitize-url'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconBoltFilled, IconCopy, IconDotsVertical, IconQrcode, IconSend } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { memo, useCallback, useMemo, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { ContentLink } from '../Content/Link/Link'
import { DialogSheet } from '../Layouts/Dialog'
import { LinkBase } from '../Links/LinkBase'
import { UserAvatar } from './UserAvatar'
import { UserContentAbout } from './UserContentAbout'
import { UserFollowings } from './UserFollowings'
import { UserNIP05 } from './UserNIP05'
import { UserProfileBanner } from './UserProfileBanner'
import { UserProfileForm } from './UserProfileForm'
import { UserRelays } from './UserRelays'

type Props = {
  pubkey: string
}

export const UserProfileHeader = memo(function UserProfileHeader(props: Props) {
  const { pubkey } = props
  const [editProfile, setEditProfile] = useState(false)
  const router = useRouter()
  const isMobile = useMobile()
  const user = useUserState(pubkey, { syncFollows: true })
  const currentPubkey = useCurrentPubkey()
  const doesFollowCurrentUser = user.followsTag(currentPubkey)
  const { nip05, lud16 } = user?.metadata || {}
  const pushImage = useSetAtom(openImageDialogAtom)
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

  const openImageDialog = (src: string) => pushImage({ src })

  const website = useMemo(() => {
    if (user.metadata?.website) {
      try {
        const url = sanitizeUrl(user.metadata.website)
        if (url === 'about:blank') {
          return false
        }
        return url
      } catch {
        return false
      }
    }
  }, [user.metadata?.website])

  return (
    <>
      <UserProfileBanner pubkey={pubkey} />
      <Divider />
      <Stack horizontal={false} gap={1} sx={styles.content}>
        <ContentProvider value={{ disableLink: true, disablePopover: true }}>
          <UserAvatar sx={styles.avatar} pubkey={pubkey} size='xl' onClick={openImageDialog} />
        </ContentProvider>
        <Stack sx={styles.center} horizontal={!isMobile} gap={isMobile ? 1 : 0}>
          <Stack grow horizontal={false}>
            <Text variant='headline' size='sm'>
              <Stack align='center'>
                {user?.displayName}
                {user.metadata?.pronouns ? (
                  <html.span style={styles.pronouns}>({user.metadata.pronouns})</html.span>
                ) : (
                  ''
                )}
                {doesFollowCurrentUser && (
                  <Text sx={styles.followsYou} variant='label' size='md'>
                    Follows You
                  </Text>
                )}
              </Stack>
            </Text>
            {nip05 && <UserNIP05 variant='label' size='lg' pubkey={pubkey} />}
            {lud16 && (
              <Stack align='flex-start'>
                <IconBoltFilled size={14} strokeWidth='1.8' style={{ position: 'relative', top: 4 }} />
                <html.span style={styles.breakWord}>{lud16}</html.span>
              </Stack>
            )}
          </Stack>
          <Stack gap={0} horizontal={false} align={isMobile ? 'flex-start' : 'flex-end'}>
            <UserFollowings pubkey={pubkey} />
            <UserRelays pubkey={pubkey} />
          </Stack>
        </Stack>
        <UserContentAbout pubkey={pubkey} />
        {website && (
          <ContentLink href={website}>
            <html.span style={styles.breakWord}>{website}</html.span>
          </ContentLink>
        )}
        <Stack sx={styles.actions} gap={0.5}>
          <Tooltip enterDelay={0} text={`Zap ${user.displayName}`}>
            <LinkBase search={{ zap: user.nprofile }} state={{ from: router.latestLocation.pathname } as never}>
              <IconButton
                variant='outlined'
                icon={<IconBoltFilled color={colors.violet5} stroke='currentColor' strokeWidth='2.0' size={20} />}
              />
            </LinkBase>
          </Tooltip>
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
                  <MenuItem
                    size='sm'
                    interactive
                    onClick={() => close()}
                    leadingIcon={<IconSend size={18} />}
                    label='Send Public Message'
                  />
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
          {pubkey !== currentPubkey ? (
            <FollowButton value={pubkey} />
          ) : (
            <>
              <DialogSheet maxWidth='sm' open={editProfile} onClose={() => setEditProfile(false)}>
                <UserProfileForm onClose={() => setEditProfile(false)} />
              </DialogSheet>
              <Button disabled={!user.event} variant='filled' onClick={() => setEditProfile(true)}>
                Edit profile
              </Button>
            </>
          )}
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
  content: {
    position: 'relative',
    paddingInline: spacing.padding3,
    paddingTop: spacing.padding8,
    paddingBottom: spacing.padding3,
  },
  center: {
    paddingBlock: spacing.padding1,
  },
  actions: {
    position: 'absolute',
    right: 22,
    top: 20,
  },
  avatar: {
    position: 'absolute',
    left: 24,
    top: -50,
    border: '4px solid',
    borderColor: palette.surfaceContainerLowest,
    transition: 'all 0.1s ease',
    transform: 'scale(1)',
    ':active': {
      transform: 'scale(0.94)',
    },
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
    // alignItems: 'flex-start',
    width: 'fit-content',
    whiteSpace: 'nowrap',
    color: palette.onSurfaceVariant,
    borderRadius: shape.lg,
    paddingBlock: 2,
    paddingInline: 6,
    backgroundColor: palette.surfaceContainerHigh,
  },
  pronouns: {
    marginLeft: spacing['margin0.5'],
    opacity: 0.8,
    fontSize: '90%',
  },
  breakWord: {
    wordBreak: 'break-word',
    maxWidth: '80%',
  },
})
