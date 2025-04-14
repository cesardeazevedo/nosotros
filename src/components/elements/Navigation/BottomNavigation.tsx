import { NotificationBadge } from '@/components/modules/Notifications/NotificationBadge'
import { focusRingTokens } from '@/components/ui/FocusRing/FocusRing.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { tabTokens } from '@/components/ui/Tab/Tab.stylex'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useMobile } from '@/hooks/useMobile'
import { useCurrentPubkey, useCurrentUser } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { encodeSafe } from '@/utils/nip19'
import { IconBell, IconBellFilled, IconPhoto, IconUser } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import { css, html } from 'react-strict-dom'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { LinkSignIn } from '../Links/LinkSignIn'
import { SignInButtonFab } from '../SignIn/SignInButtonFab'

export const BottomNavigation = observer(function BottomNavigation() {
  const user = useCurrentUser()
  const pubkey = useCurrentPubkey()
  const mobile = useMobile()

  if (!mobile) {
    return <></>
  }

  return (
    <>
      <html.div style={styles.root}>
        {!pubkey ? <SignInButtonFab /> : null}
        <Stack grow justify='space-around'>
          <Tooltip text='Home' enterDelay={0}>
            <Link to='/' resetScroll>
              {({ isActive }) => (
                <Tab active={isActive} sx={styles.tab} icon={<IconHome />} activeIcon={<IconHomeFilled />} />
              )}
            </Link>
          </Tooltip>
          <Link to='/media'>
            {({ isActive }) => (
              <Tab active={isActive} sx={styles.tab} icon={<IconPhoto />} activeIcon={<IconPhoto />} />
            )}
          </Link>
          {pubkey && (
            <Link to='/notifications'>
              {({ isActive }) => (
                <Tab
                  active={isActive}
                  sx={styles.tab}
                  icon={<NotificationBadge>{isActive ? <IconBellFilled /> : <IconBell />}</NotificationBadge>}
                />
              )}
            </Link>
          )}
          {pubkey && (
            <Link
              to='/$nostr'
              params={{ nostr: user?.nprofile || (encodeSafe(() => nip19.nprofileEncode({ pubkey })) as string) }}>
              {({ isActive }) => (
                <Tab active={isActive} sx={styles.tab} icon={<IconUser />} activeIcon={<IconUser />} />
              )}
            </Link>
          )}
          {!pubkey && (
            <LinkSignIn>
              {({ isActive }) => (
                <Tab active={isActive} sx={styles.tab} icon={<IconUser />} activeIcon={<IconUser />} />
              )}
            </LinkSignIn>
          )}
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
