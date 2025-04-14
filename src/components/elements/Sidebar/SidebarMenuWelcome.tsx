import { Button } from '@/components/ui/Button/Button'
import { listItemTokens } from '@/components/ui/ListItem/ListItem.stylex'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconSettings } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { css } from 'react-strict-dom'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { IconNostr } from '../Icons/IconNostr'
import { LinkSignIn } from '../Links/LinkSignIn'
import { SidebarMenuRelays } from './SidebarMenuRelays'

const iconProps = {
  size: 26,
  strokeWidth: '1.8',
}
export const SidebarMenuWelcome = () => {
  return (
    <MenuList elevation={0} sx={styles.root}>
      <LinkSignIn>
        <Button sx={styles.button} fullWidth variant='filled' icon={<IconNostr />}>
          Join Nostr
        </Button>
      </LinkSignIn>
      <br />
      <Link to='/'>
        {({ isActive }) => (
          <MenuItem
            selected={isActive}
            onClick={() => {}}
            leadingIcon={isActive ? <IconHomeFilled {...iconProps} /> : <IconHome {...iconProps} />}
            label='Home'
          />
        )}
      </Link>
      <SidebarMenuRelays />
      <Link to='/settings'>
        <MenuItem onClick={() => {}} leadingIcon={<IconSettings {...iconProps} />} label='Settings' />
      </Link>
    </MenuList>
  )
}

const styles = css.create({
  root: {
    width: '100%',
    borderRadius: shape.lg,
    backgroundColor: 'transparent',
    [listItemTokens.containerMinHeight$sm]: 50,
    [listItemTokens.leadingSpace]: spacing.padding3,
  },
  button: {
    height: 50,
  },
})
