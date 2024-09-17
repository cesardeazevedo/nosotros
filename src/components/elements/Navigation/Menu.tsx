import { Divider } from '@/components/ui/Divider/Divider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { shape } from '@/themes/shape.stylex'
import { IconLogout, IconUser } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { authStore } from 'stores/ui/auth.store'
import { dialogStore } from 'stores/ui/dialogs.store'
import LinkProfile from '../Links/LinkProfile'

type Props = {
  dense?: boolean
  onAction?: () => void
}

const Menu = observer(function Menu(props: Props) {
  const { dense } = props
  const iconProps = {
    size: dense ? 24 : 30,
    strokeWidth: '1.4',
  }
  return (
    <MenuList elevation={0} sx={styles.root}>
      {authStore.currentUser && (
        <LinkProfile user={authStore.currentUser} underline={false}>
          <MenuItem
            sx={styles.item}
            onClick={() => props.onAction?.()}
            leadingIcon={<IconUser {...iconProps} />}
            label='Profile'
          />
        </LinkProfile>
      )}
      {!authStore.pubkey && <MenuItem onClick={dialogStore.openAuth} label='Sign In' />}
      {authStore.pubkey && (
        <>
          <Divider />
          <MenuItem
            onClick={() => {
              authStore.logout()
              props.onAction?.()
            }}
            leadingIcon={<IconLogout {...iconProps} />}
            label='Log out'
          />
        </>
      )}
    </MenuList>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    borderRadius: shape.lg,
    backgroundColor: 'transparent',
  },
  item: {
    width: '100%',
  },
})

export default Menu
