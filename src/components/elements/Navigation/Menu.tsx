import { Divider, List, ListItemButton, ListSubheader, Typography, type TypographyProps } from '@mui/material'
import { IconLogout, IconServerBolt, IconSettings, IconUser, IconWallet } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
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
  const typographyProps: TypographyProps = {
    variant: dense ? 'body1' : 'subtitle1',
    sx: {
      ml: dense ? 2 : 4,
      fontSize: dense ? '100%' : '120%',
    },
  }
  return (
    <List>
      {authStore.currentUser && (
        <LinkProfile user={authStore.currentUser} underline='none'>
          <ListItemButton onClick={() => props.onAction?.()}>
            <IconUser {...iconProps} />
            <Typography {...typographyProps}>Profile</Typography>
          </ListItemButton>
        </LinkProfile>
      )}
      {!authStore.pubkey && (
        <ListItemButton onClick={dialogStore.openAuth}>
          <Typography {...typographyProps}>Sign In</Typography>
        </ListItemButton>
      )}
      <ListSubheader sx={{ backgroundColor: 'transparent', mt: 2, lineHeight: '12px' }}>Coming Soon</ListSubheader>
      <ListItemButton disabled>
        <IconWallet {...iconProps} />
        <Typography {...typographyProps}>Wallet</Typography>
      </ListItemButton>
      <ListItemButton disabled>
        <IconServerBolt {...iconProps} />
        <Typography {...typographyProps}>Relays</Typography>
      </ListItemButton>
      <ListItemButton disabled>
        <IconSettings {...iconProps} />
        <Typography {...typographyProps}>Settings</Typography>
      </ListItemButton>
      {authStore.pubkey && (
        <>
          <Divider sx={{ my: dense ? 1 : 0 }} />
          <ListItemButton
            onClick={() => {
              authStore.logout()
              props.onAction?.()
            }}>
            <IconLogout {...iconProps} />
            <Typography {...typographyProps}>Log out</Typography>
          </ListItemButton>
        </>
      )}
    </List>
  )
})

export default Menu
