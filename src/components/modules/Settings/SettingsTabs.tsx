import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import { useMobile } from '@/hooks/useMobile'
import { shape } from '@/themes/shape.stylex'
import { IconDatabase, IconSettings } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { css } from 'react-strict-dom'

export const SettingsTabs = () => {
  const isMobile = useMobile()
  const location = useLocation()
  return (
    <Stack gap={0.5} sx={styles.tabs} justify='flex-start'>
      <Tabs variant='secondary' anchor={location.pathname} renderLabels={!isMobile}>
        <Link to='/settings'>
          <Tab sx={styles.tab} icon={<IconSettings size={22} />} anchor='/settings' label='Preferences' />
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
    padding: 10,
  },
  tab: {
    height: 46,
    borderRadius: shape.full,
  },
})
