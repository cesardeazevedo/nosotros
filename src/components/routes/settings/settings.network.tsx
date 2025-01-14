import { SettingsClientTag } from '@/components/elements/Settings/SettingsClientTag'
import { SettingsMaxRelaysOutbox } from '@/components/elements/Settings/SettingsMaxRelaysOutbox'
import { SettingsNIP05 } from '@/components/elements/Settings/SettingsNIP05'
import { SettingsOutbox } from '@/components/elements/Settings/SettingsOutbox'
import { SettingsRelayHints } from '@/components/elements/Settings/SettingsRelayHints'
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
        <SettingsOutbox />
        <SettingsRelayHints />
        <SettingsNIP05 />
        <SettingsClientTag />
        <br />
        <SettingsSubHeader>Relay Settings</SettingsSubHeader>
        <SettingsMaxRelaysOutbox />
        <br />
      </MenuList>
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
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
