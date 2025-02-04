import { focusRingTokens } from '@/components/ui/FocusRing/FocusRing.stylex'
import { Tab } from '@/components/ui/Tab/Tab'
import { tabTokens } from '@/components/ui/Tab/Tab.stylex'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useCurrentUser } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { IconBell, IconBellFilled, IconLayoutSidebarLeftExpand, IconPhoto, IconServerBolt } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css } from 'react-strict-dom'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'

const enterDelay = 800

export const TopNavigation = observer(function TopNavigation() {
  const location = useLocation()
  const user = useCurrentUser()

  const handleClickHome = useCallback(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <>
      <Tabs anchor={location.pathname}>
        <Tooltip text='Home' enterDelay={enterDelay}>
          <Link tabIndex={-1} to='/' onClick={handleClickHome}>
            <Tab anchor='/' sx={styles.tab} icon={<IconHome />} activeIcon={<IconHomeFilled />} />
          </Link>
        </Tooltip>
        <Tooltip text='Media' enterDelay={enterDelay}>
          <Link tabIndex={-1} to='/media'>
            <Tab anchor='/media' sx={styles.tab} icon={<IconPhoto strokeWidth='1.5' size={26} />} />
          </Link>
        </Tooltip>
        <Tooltip text='Relays' enterDelay={enterDelay}>
          <Link tabIndex={-1} to='/relays' resetScroll>
            <Tab anchor='/relays' sx={styles.tab} icon={<IconServerBolt strokeWidth='1.5' size={26} />} />
          </Link>
        </Tooltip>
        <Tooltip text='Deck Mode' enterDelay={enterDelay}>
          <Link tabIndex={-1} to='/deck'>
            <Tab anchor='/deck' sx={styles.tab} icon={<IconLayoutSidebarLeftExpand strokeWidth='1.5' size={26} />} />
          </Link>
        </Tooltip>
        <Tooltip text='Notifications' enterDelay={enterDelay}>
          <Link tabIndex={-1} to='/notifications' resetScroll>
            <Tab
              anchor='/notifications'
              sx={styles.tab}
              icon={<IconBell strokeWidth='1.6' />}
              activeIcon={<IconBellFilled strokeWidth='1.6' size={26} />}
              disabled={!user}
            />
          </Link>
        </Tooltip>
      </Tabs>
    </>
  )
})

const styles = css.create({
  root: {},
  tab: {
    height: 50,
    borderRadius: shape.full,
    [tabTokens.containerShape]: shape.full,
    [focusRingTokens.color]: palette.secondaryContainer,
  },
})
