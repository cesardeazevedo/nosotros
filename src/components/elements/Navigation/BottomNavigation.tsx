import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconBell, IconBellFilled, IconServerBolt, IconUser, IconUsersGroup } from '@tabler/icons-react'
import { useMatch } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { authStore } from 'stores/ui/auth.store'
import { HideOnScroll } from '../Header/Header'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import LinkRouter from '../Links/LinkRouter'
import PostFab from '../Posts/PostFab'
import SignInButtonFab from '../SignIn/SignInButtonFab'

const BottomNavigation = observer(function BottomNavigation() {
  const { currentUser } = authStore
  const mobile = useMobile()
  useMatch({ from: '__root__' })

  if (!mobile) {
    return <></>
  }

  return (
    <HideOnScroll direction='up'>
      <html.div style={styles.root}>
        {!authStore.currentUser ? <SignInButtonFab /> : <PostFab />}
        <Stack>
          <Tabs anchor='home'>
            <Tooltip text='Home' enterDelay={0}>
              <LinkRouter to='/' resetScroll>
                <Tab anchor='home' sx={styles.tab} icon={<IconHome />} activeIcon={<IconHomeFilled />} />
              </LinkRouter>
            </Tooltip>
            <Tooltip text='Deck Mode' enterDelay={0}>
              <LinkRouter to='/'>
                <Tab anchor='relays' sx={styles.tab} icon={<IconServerBolt size={24} />} />
              </LinkRouter>
            </Tooltip>
            <Tooltip text='Communities' enterDelay={0}>
              <Tab anchor='communities' sx={styles.tab} icon={<IconUsersGroup />} />
            </Tooltip>
            <Tooltip text='Notifications' enterDelay={0}>
              <LinkRouter to='/notifications'>
                <Tab anchor='notifications' sx={styles.tab} icon={<IconBell />} activeIcon={<IconBellFilled />} />
              </LinkRouter>
            </Tooltip>
            {currentUser && (
              <Tooltip text='Profile' enterDelay={0}>
                <LinkRouter to='/$nostr' params={{ nostr: currentUser!.nprofile! }}>
                  <Tab anchor='profile' sx={styles.tab} icon={<IconUser />} activeIcon={<IconUser />} />
                </LinkRouter>
              </Tooltip>
            )}
          </Tabs>
        </Stack>
      </html.div>
    </HideOnScroll>
  )
})

const styles = css.create({
  root: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 400,
    height: 64,
    margin: 'auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBlock: spacing['padding0.5'],
    backgroundColor: palette.surface,
    //backgroundColor: `rgba(${backgroundChannel} / 0.66)`,
    backdropFilter: 'blur(4px)',
  },
  tab: {
    height: 50,
    borderRadius: shape.full,
  },
})

export default BottomNavigation
