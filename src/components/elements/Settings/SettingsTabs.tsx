import { focusRingTokens } from '@/components/ui/FocusRing/FocusRing.stylex'
import { rippleTokens } from '@/components/ui/Ripple/Ripple.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { tabTokens } from '@/components/ui/Tab/Tab.stylex'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import { useMobile } from '@/hooks/useMobile'
import { shape } from '@/themes/shape.stylex'
import { IconBrush, IconDatabase, IconHeart, IconServerBolt } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { css } from 'react-strict-dom'

export const SettingsTabs = () => {
  const isMobile = useMobile()
  const loc = useLocation()
  return (
    <Stack gap={0.5} sx={styles.tabs} align='stretch' justify='space-around'>
      <Tabs variant='secondary' anchor={loc.pathname} renderLabels={!isMobile}>
        {/* <Link to='/settings'> */}
        {/*   <Tab sx={styles.tab} icon={<IconUser size={22} />} anchor='/settings' label='Profile' /> */}
        {/* </Link> */}
        <Link to='/settings'>
          <Tab sx={styles.tab} icon={<IconBrush size={22} />} anchor='/settings' label='Display' />
        </Link>
        <Link to='/settings/content'>
          <Tab sx={styles.tab} icon={<IconHeart size={22} />} anchor='/settings/content' label='Content' />
        </Link>
        <Link to='/settings/network'>
          <Tab sx={styles.tab} icon={<IconServerBolt size={22} />} anchor='/settings/network' label='Network' />
        </Link>
        <Link to='/settings/storage'>
          <Tab sx={styles.tab} icon={<IconDatabase size={22} />} anchor='/settings/storage' label='Storage' />
        </Link>
      </Tabs>
    </Stack>
  )
}

const styles = css.create({
  tabs: {
    overflowX: 'auto',
    [rippleTokens.height]: 46,
    [tabTokens.containerShape]: shape.full,
  },
  tab: {
    borderRadius: shape.full,
  },
})
