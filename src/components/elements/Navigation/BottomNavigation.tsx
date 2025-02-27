import { Badge } from '@/components/ui/Badge/Badge'
import { focusRingTokens } from '@/components/ui/FocusRing/FocusRing.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { tabTokens } from '@/components/ui/Tab/Tab.stylex'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useMobile } from '@/hooks/useMobile'
import { useCurrentPubkey, useCurrentUser, useRootStore } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconBell, IconBellFilled, IconPhoto, IconUser } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { LinkSignIn } from '../Links/LinkSignIn'
import { SignInButtonFab } from '../SignIn/SignInButtonFab'

export const BottomNavigation = observer(function BottomNavigation() {
  const root = useRootStore()
  const user = useCurrentUser()
  const pubkey = useCurrentPubkey()
  const mobile = useMobile()
  const location = useLocation()

  if (!mobile) {
    return <></>
  }

  return (
    <>
      <html.div style={styles.root}>
        {!pubkey ? <SignInButtonFab /> : null}
        <Stack grow justify='space-around'>
          <Tabs anchor={location.pathname}>
            <Tooltip text='Home' enterDelay={0}>
              <Link to='/' resetScroll>
                <Tab anchor='/' sx={styles.tab} icon={<IconHome />} activeIcon={<IconHomeFilled />} />
              </Link>
            </Tooltip>
            <Link to='/media'>
              <Tab anchor='/media' sx={styles.tab} icon={<IconPhoto />} activeIcon={<IconPhoto />} />
            </Link>
            {user && (
              <Link to='/notifications'>
                <Tab
                  anchor='/notifications'
                  sx={styles.tab}
                  icon={<IconBell />}
                  activeIcon={<IconBellFilled />}
                  badge={<Badge maxValue={20} value={root.rootNotifications?.feed.unseen?.length} />}
                />
              </Link>
            )}
            {user && (
              <Link to='/$nostr' params={{ nostr: user!.nprofile! }}>
                <Tab anchor={`/${user.nprofile}`} sx={styles.tab} icon={<IconUser />} activeIcon={<IconUser />} />
              </Link>
            )}
            {!pubkey && (
              <LinkSignIn>
                <Tab anchor={`/signin_in`} sx={styles.tab} icon={<IconUser />} activeIcon={<IconUser />} />
              </LinkSignIn>
            )}
          </Tabs>
        </Stack>
      </html.div>
    </>
  )
})

const styles = css.create({
  root: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
    margin: 'auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.padding1,
    paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
    backgroundColor: palette.surfaceContainerLowest,
  },
  tab: {
    height: 50,
    width: 70,
    borderRadius: shape.full,
    [tabTokens.containerShape]: shape.full,
    [focusRingTokens.color]: palette.secondaryContainer,
  },
})
