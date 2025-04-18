import { Button } from '@/components/ui/Button/Button'
import { listItemTokens } from '@/components/ui/ListItem/ListItem.stylex'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconBell, IconListDetails, IconNews, IconPhoto, IconPhotoFilled, IconSettings } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useContext } from 'react'
import { css } from 'react-strict-dom'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { IconNostr } from '../Icons/IconNostr'
import { LinkSignIn } from '../Links/LinkSignIn'
import { SidebarContext } from './SidebarContext'
import { SidebarMenuRelays } from './SidebarMenuRelays'

const iconProps = {
  size: 26,
  strokeWidth: '1.8',
}

export const SidebarMenuWelcome = () => {
  const context = useContext(SidebarContext)
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
            onClick={() => context.setPane(false)}
            leadingIcon={isActive ? <IconHomeFilled {...iconProps} /> : <IconHome {...iconProps} />}
            label='Home'
          />
        )}
      </Link>
      <Link to='/media'>
        {({ isActive }) => (
          <MenuItem
            selected={isActive}
            onClick={() => context.setPane(false)}
            leadingIcon={isActive ? <IconPhotoFilled {...iconProps} /> : <IconPhoto {...iconProps} />}
            label='Media'
          />
        )}
      </Link>
      <Link to='/articles'>
        {({ isActive }) => (
          <MenuItem
            selected={isActive}
            onClick={() => context.setPane(false)}
            leadingIcon={<IconNews {...iconProps} />}
            label='Articles'
          />
        )}
      </Link>
      <MenuItem disabled leadingIcon={<IconBell {...iconProps} />} label='Notifications' />
      <MenuItem disabled leadingIcon={<IconListDetails {...iconProps} />} label='Lists' />
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
