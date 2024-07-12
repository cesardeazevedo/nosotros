import { Divider, List, ListItemButton, ListSubheader, Typography, type TypographyProps } from '@mui/material'
import { IconBookmark, IconLogout, IconServerBolt, IconSettings, IconUser, IconWallet } from '@tabler/icons-react'
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
  const iconProps = { size: dense ? 24 : 30, strokeWidth: '1.4' }
  const typographyProps: TypographyProps = { variant: dense ? 'body1' : 'h6', sx: { ml: dense ? 2 : 4 } }
  return (
    <List sx={{ '>div': { my: dense ? 0.5 : 1, mx: dense ? 1 : 2, borderRadius: dense ? 1 : 2 } }}>
      {authStore.currentUser && (
        <LinkProfile user={authStore.currentUser} underline='none'>
          <ListItemButton dense={dense} onClick={() => props.onAction?.()}>
            <IconUser {...iconProps} />
            <Typography {...typographyProps}>Profile</Typography>
          </ListItemButton>
        </LinkProfile>
      )}
      {!authStore.pubkey && (
        <ListItemButton dense={dense} onClick={dialogStore.openAuth}>
          <Typography {...typographyProps}>Sign In</Typography>
        </ListItemButton>
      )}
      <ListSubheader sx={{ backgroundColor: 'transparent', mt: 2, lineHeight: '12px' }}>Coming Soon</ListSubheader>
      <ListItemButton dense={dense} disabled>
        <IconWallet {...iconProps} />
        <Typography {...typographyProps}>Wallet</Typography>
      </ListItemButton>
      <ListItemButton dense={dense} disabled>
        <IconServerBolt {...iconProps} />
        <Typography {...typographyProps}>Relays</Typography>
      </ListItemButton>
      <ListItemButton dense={dense} disabled>
        <IconBookmark {...iconProps} />
        <Typography {...typographyProps}>Bookmarks</Typography>
      </ListItemButton>
      <ListItemButton dense={dense} disabled>
        <IconSettings {...iconProps} />
        <Typography {...typographyProps}>Settings</Typography>
      </ListItemButton>
      {authStore.pubkey && (
        <>
          <Divider sx={{ my: dense ? 1 : 0 }} />
          <ListItemButton
            dense={dense}
            onClick={() => {
              authStore.logout()
              props.onAction?.()
            }}>
            <IconLogout {...iconProps} />
            <Typography {...typographyProps}>Sign out</Typography>
          </ListItemButton>
        </>
      )}
    </List>
  )
})

export default Menu
