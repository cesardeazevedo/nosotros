import { Divider } from '@/components/ui/Divider/Divider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Switch } from '@/components/ui/Switch/Switch'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconBolt, IconHeart } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { settingsStore } from 'stores/ui/settings.store'

const SettingsNostr = observer(function SettingsNostr() {
  return (
    <MenuList elevation={0} sx={styles.root}>
      <Text size='md' sx={styles.subheader}>
        Config
      </Text>
      <MenuItem
        label='Outbox'
        supportingText='The outbox model helps you find notes from others people relays'
        trailing={
          <Switch
            checked={settingsStore.nostrSettings.outboxEnabled}
            onChange={() => settingsStore.toggleSettings('outboxEnabled')}
          />
        }
      />
      <MenuItem
        label='Relay hints'
        supportingText='The outbox model helps you find notes from others people relays'
        trailing={
          <Switch
            checked={settingsStore.nostrSettings.hintsEnabled}
            onChange={() => settingsStore.toggleSettings('hintsEnabled')}
          />
        }
      />
      <MenuItem
        label='NIP05'
        trailing={
          <Switch
            checked={settingsStore.nostrSettings.nip05enabled}
            onChange={() => settingsStore.toggleSettings('nip05enabled')}
          />
        }
      />
      <Divider />
      <Text size='md' sx={styles.subheader}>
        UI
      </Text>
      <MenuItem
        label='Reactions'
        leadingIcon={<IconHeart />}
        trailing={
          <Switch
            checked={settingsStore.nostrSettings.nip25enabled}
            onChange={() => settingsStore.toggleSettings('nip25enabled')}
          />
        }
      />
      <MenuItem
        label='Zaps'
        leadingIcon={<IconBolt />}
        trailing={
          <Switch
            checked={settingsStore.nostrSettings.nip57enabled}
            onChange={() => settingsStore.toggleSettings('nip57enabled')}
          />
        }
      />
    </MenuList>
  )
})

const styles = css.create({
  root: {
    borderRadius: shape.lg,
    backgroundColor: 'inherit',
  },
  subheader: {
    color: palette.onSurfaceVariant,
    marginLeft: spacing.margin2,
  },
})

export default SettingsNostr
