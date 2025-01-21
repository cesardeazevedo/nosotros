import { Divider } from '@/components/ui/Divider/Divider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { useCurrentUser, useRootStore } from '@/hooks/useRootStore'
import { shape } from '@/themes/shape.stylex'
import { IconLogout, IconSettings, IconUser } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { LinkProfile } from '../Links/LinkProfile'
import { LinkSignIn } from '../Links/LinkSignIn'

type Props = {
  dense?: boolean
  onAction?: () => void
}

export const Menu = observer(function Menu(props: Props) {
  const { dense } = props
  const logout = useRootStore().auth.logout
  const user = useCurrentUser()
  const iconProps = {
    size: dense ? 24 : 30,
    strokeWidth: '1.4',
  }
  return (
    <MenuList elevation={0} sx={styles.root}>
      {user && (
        <LinkProfile user={user} underline={false}>
          <MenuItem
            sx={styles.item}
            onClick={() => props.onAction?.()}
            leadingIcon={<IconUser {...iconProps} />}
            label='Profile'
          />
        </LinkProfile>
      )}
      {user && (
        <Link to='/settings'>
          <MenuItem
            sx={styles.item}
            leadingIcon={<IconSettings size={22} strokeWidth='1.5' />}
            onClick={props.onAction}
            label='Settings'
          />
        </Link>
      )}
      {!user && (
        <LinkSignIn>
          <MenuItem label='Sign In' />
        </LinkSignIn>
      )}
      {user && (
        <>
          <Divider />
          <MenuItem
            onClick={() => {
              logout()
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
