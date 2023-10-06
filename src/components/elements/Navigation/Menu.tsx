import { Divider, List, ListItemButton, ListSubheader, Typography, TypographyProps } from '@mui/material'
import { IconBookmark, IconLogout, IconServerBolt, IconSettings, IconUser, IconWallet } from '@tabler/icons-react'
import { useStore } from 'stores'

type Props = {
  dense?: boolean
  onAction?: () => void
}

function Menu(props: Props) {
  const { dense } = props
  const store = useStore()
  const iconProps = { size: dense ? 24 : 30, strokeWidth: '1.4' }
  const typographyProps: TypographyProps = { variant: dense ? 'body1' : 'h6', sx: { ml: dense ? 2 : 4 } }
  return (
    <List sx={{ '>div': { my: dense ? 0.5 : 1, mx: dense ? 1 : 2, borderRadius: dense ? 1 : 2 } }}>
      {store.auth.currentUser && (
        <ListItemButton dense={dense}>
          <IconUser {...iconProps} />
          <Typography {...typographyProps}>Profile</Typography>
        </ListItemButton>
      )}
      {!store.auth.currentUser && (
        <ListItemButton dense={dense} onClick={store.dialogs.openAuth}>
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
      {store.auth.currentUser && (
        <>
          <Divider sx={{ my: dense ? 1 : 0 }} />
          <ListItemButton
            dense={dense}
            onClick={() => {
              store.auth.logout()
              props.onAction?.()
            }}>
            <IconLogout {...iconProps} />
            <Typography {...typographyProps}>Sign out</Typography>
          </ListItemButton>
        </>
      )}
    </List>
  )
}

export default Menu
