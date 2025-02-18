import { ContentProvider } from '@/components/providers/ContentProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useCurrentPubkey, useCurrentUser } from '@/hooks/useRootStore'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconQrcode } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { dialogStore } from 'stores/ui/dialogs.store'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { Menu } from './Menu'

export const ProfilePopover = observer(function ProfilePopover() {
  const user = useCurrentUser()
  const pubkey = useCurrentPubkey()
  return (
    <ContentProvider value={{ disablePopover: true }}>
      <Popover
        floatingStrategy='fixed'
        placement='bottom-end'
        contentRenderer={() => (
          <Paper elevation={2} shape='lg' surface='surfaceContainerLow' sx={styles.root}>
            <html.img src={user?.meta.banner} style={styles.image} />
            <Stack sx={styles.header} justify='space-between'>
              {pubkey && <UserName pubkey={pubkey} />}
              <Tooltip cursor='arrow' placement='bottom' text='Use the QR Code to scan your npub on your mobile device'>
                <IconButton onClick={dialogStore.openQRCode} icon={<IconQrcode strokeWidth='1.5' />} />
              </Tooltip>
            </Stack>
            <Menu dense onAction={() => {}} />
          </Paper>
        )}>
        {({ getProps, setRef, open }) => (
          <div onClick={open} {...getProps} ref={setRef}>
            <ContentProvider value={{ disableLink: true, disablePopover: true }}>
              <UserAvatar pubkey={user?.pubkey} />
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
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  image: {
    height: 110,
    width: '100%',
    objectFit: 'cover',
    borderTopRightRadius: shape.lg,
    borderTopLeftRadius: shape.lg,
  },
})
