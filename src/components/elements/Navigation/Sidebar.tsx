import { DrawerSwipeable } from '@/components/ui/Drawer/DrawerSwipeable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { listItemTokens } from '@/components/ui/ListItem/ListItem.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconMenu2, IconQrcode } from '@tabler/icons-react'
import { Observer } from 'mobx-react-lite'
import { useState } from 'react'
import { css, html } from 'react-strict-dom'
import { dialogStore } from 'stores/ui/dialogs.store'
import { ThemeButton } from '../Buttons/ThemeButton'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { Menu } from './Menu'

export const Sidebar = () => {
  const [open, setOpen] = useState(false)
  const pubkey = useCurrentPubkey()
  return (
    <>
      <IconButton onClick={() => setOpen(true)} icon={<IconMenu2 />} />
      <DrawerSwipeable anchor='left' opened={open} onClose={() => setOpen(false)}>
        <html.div style={styles.content}>
          <ThemeButton sx={styles.themeButton} />
          <Observer>
            {() => (
              <Stack horizontal={false} sx={styles.header}>
                {pubkey && (
                  <>
                    <UserAvatar pubkey={pubkey} />
                    <UserName variant='title' size='lg' pubkey={pubkey} sx={styles.userName} />
                    <IconButton sx={styles.qrcodeButton} disabled={!pubkey} onClick={dialogStore.openQRCode}>
                      <IconQrcode size={30} strokeWidth='2' />
                    </IconButton>
                  </>
                )}
              </Stack>
            )}
          </Observer>
          <html.div style={styles.wrapper}>
            <Menu onAction={() => setOpen(false)} />
          </html.div>
        </html.div>
      </DrawerSwipeable>
    </>
  )
}

const styles = css.create({
  content: {
    width: 300,
    backgroundColor: palette.surface,
  },
  header: {
    padding: spacing.padding2,
  },
  wrapper: {
    paddingInline: spacing.padding1,
    [listItemTokens.containerMinHeight$sm]: 50,
  },
  themeButton: {
    position: 'absolute',
    left: 30,
    bottom: 30,
  },
  qrcodeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    color: palette.primary,
  },
  userName: {
    marginTop: spacing.margin2,
    fontWeight: 500,
  },
})
