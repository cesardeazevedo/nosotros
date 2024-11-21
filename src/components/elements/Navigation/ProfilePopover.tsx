import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { authStore } from '@/stores/ui'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconQrcode } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { dialogStore } from 'stores/ui/dialogs.store'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { Menu } from './Menu'

export const ProfilePopover = observer(function ProfilePopover() {
  const { currentUser: user } = authStore
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
  const handleOpen = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(e.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  return (
    <PopoverBase
      opened={Boolean(anchorEl)}
      onClose={handleClose}
      placement='bottom-end'
      contentRenderer={() => (
        <Paper elevation={2} shape='lg' surface='surfaceContainerLow' sx={styles.root}>
          <html.img src={user?.meta.banner} style={styles.image} />
          <Stack sx={styles.header} justify='space-between'>
            <UserName pubkey={user?.pubkey} disableLink disablePopover />
            <Tooltip cursor='arrow' placement='bottom' text='Use the QR Code to scan your npub on your mobile device'>
              <IconButton onClick={dialogStore.openQRCode} icon={<IconQrcode strokeWidth='1.5' />} />
            </Tooltip>
          </Stack>
          <Menu dense onAction={handleClose} />
        </Paper>
      )}>
      {({ getProps, setRef }) => (
        <div onClick={handleOpen} {...getProps} ref={setRef}>
          <UserAvatar pubkey={user?.pubkey} disableLink disabledPopover />
        </div>
      )}
    </PopoverBase>
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
