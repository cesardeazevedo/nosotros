import { toggleQRCodeDialogAtom } from '@/atoms/dialog.atoms'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconQrcode } from '@tabler/icons-react'
import { useSetAtom } from 'jotai'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { UserProfileBanner } from '../User/UserProfileBanner'
import { ProfilePopoverMenu } from './ProfilePopoverMenu'

export const ProfilePopover = memo(function ProfilePopover() {
  const pubkey = useCurrentPubkey()
  const openQRCode = useSetAtom(toggleQRCodeDialogAtom)
  return (
    <ContentProvider value={{ disablePopover: true }}>
      <Popover
        floatingStrategy='fixed'
        placement='bottom-end'
        contentRenderer={(props) => (
          <Paper elevation={2} shape='lg' surface='surfaceContainerLow' sx={styles.root}>
            {pubkey && <UserProfileBanner dense pubkey={pubkey} sx={styles.image} />}
            <Stack sx={styles.header} justify='space-between'>
              <ContentProvider value={{ disableLink: true }}>{pubkey && <UserName pubkey={pubkey} />}</ContentProvider>
              <Tooltip cursor='arrow' placement='bottom' text='Use the QR Code to scan your npub on your mobile device'>
                <IconButton
                  onClick={() => {
                    if (pubkey) {
                      openQRCode(pubkey)
                    }
                    props.close()
                  }}
                  icon={<IconQrcode strokeWidth='1.5' />}
                />
              </Tooltip>
            </Stack>
            <ProfilePopoverMenu onAction={() => props.close()} />
          </Paper>
        )}>
        {({ getProps, setRef, open }) => (
          <div onClick={open} {...getProps()} ref={setRef}>
            <ContentProvider value={{ disableLink: true, disablePopover: true }}>
              {pubkey && <UserAvatar pubkey={pubkey} />}
            </ContentProvider>
          </div>
        )}
      </Popover>
    </ContentProvider>
  )
})

const styles = css.create({
  root: {
    width: 260,
  },
  header: {
    overflow: 'hidden',
    paddingTop: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  image: {
    borderTopRightRadius: shape.lg,
    borderTopLeftRadius: shape.lg,
  },
})
