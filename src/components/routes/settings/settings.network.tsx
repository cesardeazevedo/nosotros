import { SettingsMaxRelaysInbox } from '@/components/elements/Settings/SettingsMaxRelaysInbox'
import { SettingsMaxRelaysOutbox } from '@/components/elements/Settings/SettingsMaxRelaysOutbox'
import { SettingsNetwork } from '@/components/elements/Settings/SettingsNetwork'
import { SettingsSubHeader } from '@/components/elements/Settings/SettingsSubHeader'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

export const SettingsNetworkRoute = () => {
  const isMobile = useMobile()
  return (
    <Stack horizontal={false} sx={[styles.root, isMobile && styles.root$mobile]}>
      <MenuList sx={styles.menu} elevation={0} surface='surfaceContainerLowest'>
        <SettingsSubHeader>Network Settings</SettingsSubHeader>
        <SettingsNetwork />
        <br />
        <SettingsSubHeader>Relay Settings</SettingsSubHeader>
        <SettingsMaxRelaysOutbox />
        <SettingsMaxRelaysInbox />
        <br />
        <SettingsSubHeader>Local Relays</SettingsSubHeader>
      </MenuList>
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding6,
    width: '100%',
  },
  root$mobile: {
    padding: spacing.padding2,
  },
  header: {
    paddingLeft: spacing.padding2,
  },
  menu: {},
})
