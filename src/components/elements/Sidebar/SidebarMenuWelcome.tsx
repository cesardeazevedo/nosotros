import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { shape } from '@/themes/shape.stylex'
import { IconBell, IconListDetails, IconNews, IconPhoto, IconPhotoFilled, IconSettings } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useContext } from 'react'
import { css, html } from 'react-strict-dom'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { IconNostr } from '../Icons/IconNostr'
import { LinkSignIn } from '../Links/LinkSignIn'
import { SidebarContext } from './SidebarContext'
import { SidebarMenuDecks } from './SidebarMenuDecks'
import { SidebarMenuRelays } from './SidebarMenuRelays'

const iconProps = {
  size: 26,
  strokeWidth: '1.8',
}

export const SidebarMenuWelcome = () => {
  const context = useContext(SidebarContext)
  const isMobile = useMobile()
  return (
    <Stack horizontal={false} sx={styles.root} gap={1}>
      <Stack horizontal={false} gap={0.5} sx={styles.wrapper}>
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
        <MenuItem
          leadingIcon={<IconListDetails {...iconProps} />}
          label='Lists'
          onClick={() => context.setPane('/lists')}
        />
      </Stack>
      {!isMobile && (
        <>
          <Divider />
          <html.div style={styles.wrapper}>
            <SidebarMenuDecks expanded />
          </html.div>
        </>
      )}
      <Stack horizontal={false} gap={0.5} sx={styles.wrapper}>
        <SidebarMenuRelays />
        <Link to='/settings'>
          <MenuItem onClick={() => {}} leadingIcon={<IconSettings {...iconProps} />} label='Settings' />
        </Link>
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {
    width: '100%',
    borderRadius: shape.lg,
    backgroundColor: 'transparent',
  },
  wrapper: {
    width: '100%',
    paddingInline: 12,
  },
  button: {
    height: 50,
  },
})
