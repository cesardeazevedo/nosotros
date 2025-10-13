import { toggleSearchDialogAtom } from '@/atoms/dialog.atoms'
import { NotificationBadge } from '@/components/modules/Notifications/NotificationBadge'
import { focusRingTokens } from '@/components/ui/FocusRing/FocusRing.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { tabTokens } from '@/components/ui/Tab/Tab.stylex'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { feedRefresh$ } from '@/hooks/state/useFeed'
import { useCurrentPubkey, useCurrentUser } from '@/hooks/useAuth'
import { useMobile, useXS } from '@/hooks/useMobile'
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
import { Link, useMatch, useRouter } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { nip19 } from 'nostr-tools'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { LinkSignIn } from '../Links/LinkSignIn'
import { UserAvatar } from '../User/UserAvatar'

export const BottomNavigation = memo(function BottomNavigation() {
  const pubkey = useCurrentPubkey()
  const user = useCurrentUser()
  const isXS = useXS()
  const mobile = useMobile()
  const router = useRouter()
  const isIndexRoute = !!useMatch({ from: '/', shouldThrow: false })
  const isThreadsRoute = !!useMatch({ from: '/threads', shouldThrow: false })
  const isSearch = !!useMatch({ from: '/search', shouldThrow: false })
  const isHome = isIndexRoute || isThreadsRoute
  const toggleSearch = useSetAtom(toggleSearchDialogAtom)

  if (!mobile) {
    return <></>
  }

  const handleResetScroll = (routes: string[], module: string) => () => {
    if (routes.includes(router.latestLocation.pathname)) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      if (window.scrollY > 200) {
        setTimeout(() => {
          feedRefresh$.next(module)
        }, 700)
      } else {
        feedRefresh$.next(module)
      }
    }
  }

  const nprofile = user?.nprofile || encodeSafe(() => nip19.nprofileEncode({ pubkey: pubkey || '' }))

  return (
    <>
      <html.div style={styles.root}>
        <Stack grow justify='space-around'>
          <Tooltip text='Home' enterDelay={0}>
            <Link
              to={isIndexRoute ? '/' : isThreadsRoute ? '/threads' : '/'}
              onClick={handleResetScroll(['/', '/threads'], 'home')}>
              <Tab active={isHome} sx={styles.tab} icon={<IconHome />} activeIcon={<IconHomeFilled />} />
            </Link>
          </Tooltip>
          <div>
            <Tab active={isSearch} sx={styles.tab} icon={<IconSearch />} onClick={() => toggleSearch()} />
          </div>
          {!isXS && (
            <Link to='/media' onClick={handleResetScroll(['/media'], 'media')}>
              {({ isActive }) => (
                <Tab active={isActive} sx={styles.tab} icon={<IconPhoto />} activeIcon={<IconPhoto />} />
              )}
            </Link>
          )}
          <Link to='/articles' onClick={handleResetScroll(['/articles'], 'articles')}>
            {({ isActive }) => <Tab active={isActive} sx={styles.tab} icon={<IconNews />} />}
          </Link>
          {!pubkey && (
            <Link to='/relays'>
              {({ isActive }) => <Tab active={isActive} sx={styles.tab} icon={<IconServerBolt />} />}
            </Link>
          )}
          {pubkey && (
            <Link to='/notifications' onClick={handleResetScroll(['/notifications'], 'notification')}>
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
            <Link to='/$nostr' params={{ nostr: nprofile }}>
              {({ isActive }) => (
                <Tab
                  active={isActive}
                  sx={[styles.tab, styles.tabProfile]}
                  icon={<UserAvatar size='xs' pubkey={pubkey} />}
                />
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
    width: 54,
    minWidth: 54,
    borderRadius: shape.full,
    [tabTokens.containerShape]: shape.full,
    [focusRingTokens.color]: palette.secondaryContainer,
  },
  tabProfile: {
    backgroundColor: 'transparent',
  },
})
