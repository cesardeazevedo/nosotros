import { DrawerSwipeable } from '@/components/ui/Drawer/DrawerSwipeable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconMenu2, IconQrcode } from '@tabler/icons-react'
import { Observer } from 'mobx-react-lite'
import { useState } from 'react'
import { css, html } from 'react-strict-dom'
import { authStore } from 'stores/ui/auth.store'
import { dialogStore } from 'stores/ui/dialogs.store'
import ThemeButton from '../Buttons/ThemeButton'
import UserAvatar from '../User/UserAvatar'
import UserName from '../User/UserName'
import Menu from './Menu'

function Sidebar() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <IconButton onClick={() => setOpen(true)} icon={<IconMenu2 />} />
      <DrawerSwipeable anchor='left' opened={open} onClose={() => setOpen(false)}>
        <html.div style={styles.content}>
          <ThemeButton sx={styles.themeButton} />
          <Observer>
            {() => {
              const { currentUser: me } = authStore
              return (
                <>
                  {me && <UserAvatar user={me} />}
                  {me && <UserName variant='headline' size='sm' user={me} sx={styles.userName} />}
                  <IconButton sx={styles.qrcodeButton} disabled={!me} onClick={dialogStore.openQRCode}>
                    <IconQrcode size={30} strokeWidth='2' />
                  </IconButton>
                </>
              )
            }}
          </Observer>
          <Menu onAction={() => setOpen(false)} />
        </html.div>
      </DrawerSwipeable>
    </>
  )
}

const styles = css.create({
  content: {
    width: 300,
    padding: spacing.padding2,
    backgroundColor: palette.surface,
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

export default Sidebar
