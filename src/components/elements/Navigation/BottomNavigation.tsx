import { NotificationBadge } from '@/components/modules/Notifications/NotificationBadge'
import { focusRingTokens } from '@/components/ui/FocusRing/FocusRing.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { tabTokens } from '@/components/ui/Tab/Tab.stylex'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useMobile } from '@/hooks/useMobile'
import { useCurrentPubkey, useCurrentUser } from '@/hooks/useRootStore'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { encodeSafe } from '@/utils/nip19'
import {
  IconBell,
  IconBellFilled,
  IconNews,
  IconPhoto,
  IconSearch,
  IconServerBolt,
  IconUser,
} from '@tabler/icons-react'
import { Link, useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import { css, html } from 'react-strict-dom'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { LinkSignIn } from '../Links/LinkSignIn'

export const BottomNavigation = observer(function BottomNavigation() {
  const user = useCurrentUser()
  const pubkey = useCurrentPubkey()
  const mobile = useMobile()
  const router = useRouter()

  if (!mobile) {
    return <></>
  }

  const handleResetScroll = (route: string) => () => {
    if (router.latestLocation.pathname === route) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => {
        router.invalidate()
      }, 700)
    }
  }

  const nprofile = user?.nprofile || (encodeSafe(() => nip19.nprofileEncode({ pubkey: pubkey || '' })))

  return (
    <>
      <html.div style={styles.root}>
        <Stack grow justify='space-around'>
          <Tooltip text='Home' enterDelay={0}>
            <Link to='/' onClick={handleResetScroll('/')}>
              {({ isActive }) => (
                <Tab active={isActive} sx={styles.tab} icon={<IconHome />} activeIcon={<IconHomeFilled />} />
              )}
            </Link>
          </Tooltip>
          <div>
            <Tab sx={styles.tab} icon={<IconSearch />} onClick={() => dialogStore.toggleSearch()} />
          </div>
          <Link to='/media' onClick={handleResetScroll('/media')}>
            {({ isActive }) => (
              <Tab active={isActive} sx={styles.tab} icon={<IconPhoto />} activeIcon={<IconPhoto />} />
            )}
          </Link>
          <Link to='/articles' onClick={handleResetScroll('/articles')}>{({ isActive }) => <Tab active={isActive} sx={styles.tab} icon={<IconNews />} />}</Link>
          {!pubkey && (
            <Link to='/explore/relays'>
              {({ isActive }) => <Tab active={isActive} sx={styles.tab} icon={<IconServerBolt />} />}
            </Link>
          )}
          {pubkey && (
            <Link to='/notifications' onClick={handleResetScroll('/notifications')}>
              {({ isActive }) => (
                <Tab
                  active={isActive}
                  sx={styles.tab}
                  icon={<NotificationBadge>{isActive ? <IconBellFilled /> : <IconBell />}</NotificationBadge>}
                />
              )}
            </Link>
          )}
          {pubkey && nprofile && (
            <Link
              to='/$nostr'
              params={{ nostr: nprofile }}
              onClick={handleResetScroll('/' + nprofile)}>
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
    width: 60,
    borderRadius: shape.full,
    [tabTokens.containerShape]: shape.full,
    [focusRingTokens.color]: palette.secondaryContainer,
  },
})
