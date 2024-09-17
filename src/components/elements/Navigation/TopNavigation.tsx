import { Tab } from '@/components/ui/Tab/Tab'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { shape } from '@/themes/shape.stylex'
import { IconBell, IconBellFilled, IconServerBolt, IconUsersGroup } from '@tabler/icons-react'
import { css } from 'react-strict-dom'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import LinkRouter from '../Links/LinkRouter'

const enterDelay = 0

export const TopNavigation = () => {
  return (
    <>
      <Tabs anchor='home'>
        <Tooltip text='Home' enterDelay={enterDelay}>
          <LinkRouter to='/'>
            <Tab anchor='home' sx={styles.tab} icon={<IconHome />} activeIcon={<IconHomeFilled />} />
          </LinkRouter>
        </Tooltip>
        <Tooltip text='Relays' enterDelay={enterDelay}>
          <LinkRouter to='/deck'>
            <Tab anchor='relays' sx={styles.tab} icon={<IconServerBolt size={24} />} />
          </LinkRouter>
        </Tooltip>
        {/* <Tooltip text='Deck Mode' enterDelay={enterDelay}> */}
        {/*   <LinkRouter to='/deck'> */}
        {/*     <Tab anchor='deck' sx={styles.tab} icon={<IconLayoutSidebarLeftExpand size={24} />} /> */}
        {/*   </LinkRouter> */}
        {/* </Tooltip> */}
        <Tooltip text='Communities' enterDelay={enterDelay}>
          <Tab anchor='communities' sx={styles.tab} icon={<IconUsersGroup />} />
        </Tooltip>
        <Tooltip text='Notifications' enterDelay={enterDelay}>
          <LinkRouter to='/notifications'>
            <Tab anchor='notifications' sx={styles.tab} icon={<IconBell />} activeIcon={<IconBellFilled />} />
          </LinkRouter>
        </Tooltip>
      </Tabs>
    </>
  )
}

const styles = css.create({
  root: {},
  tab: {
    height: 50,
    borderRadius: shape.full,
  },
})
