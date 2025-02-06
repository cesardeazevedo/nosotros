import { Divider } from '@/components/ui/Divider/Divider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { useCurrentPubkey, useRootStore } from '@/hooks/useRootStore'
import { shape } from '@/themes/shape.stylex'
import { IconLogout, IconPhoto, IconServerBolt, IconSettingsFilled, IconUserFilled } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { IconNostr } from '../Icons/IconNostr'
import { LinkProfile } from '../Links/LinkProfile'
import { LinkSignIn } from '../Links/LinkSignIn'

type Props = {
  dense?: boolean
  onAction?: () => void
}

export const Menu = observer(function Menu(props: Props) {
  const { dense } = props
  const logout = useRootStore().auth.logout
  const pubkey = useCurrentPubkey()
  const iconProps = {
    size: dense ? 24 : 28,
    strokeWidth: '1.4',
  }
  return (
    <MenuList elevation={0} sx={styles.root}>
      {pubkey && (
        <LinkProfile pubkey={pubkey} underline={false}>
          <MenuItem
            sx={styles.item}
            onClick={() => props.onAction?.()}
            leadingIcon={<IconUserFilled {...iconProps} />}
            label='Profile'
          />
        </LinkProfile>
      )}
      {!pubkey && (
        <LinkSignIn>
          <MenuItem leadingIcon={<IconNostr />} label='Join Nostr' />
        </LinkSignIn>
      )}
      {pubkey && (
        <Link to='/media'>
          <MenuItem onClick={() => props.onAction?.()} leadingIcon={<IconPhoto />} label='Media' />
        </Link>
      )}
      {pubkey && (
        <Link to='/relays'>
          <MenuItem onClick={() => props.onAction?.()} leadingIcon={<IconServerBolt />} label='Relays' />
        </Link>
      )}
      <Link to='/settings'>
        <MenuItem
          sx={styles.item}
          leadingIcon={<IconSettingsFilled {...iconProps} />}
          onClick={props.onAction}
          label='Settings'
        />
      </Link>
      {pubkey && (
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
