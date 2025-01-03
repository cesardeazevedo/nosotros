import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Switch } from '@/components/ui/Switch/Switch'
import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import { observer } from 'mobx-react-lite'

export const SettingsRelayHints = observer(function SettingsOutbox() {
  const settings = useGlobalNostrSettings()
  return (
    <MenuItem
      label='Relay hints'
      trailing={<Switch checked={settings.hints} onChange={() => settings.toggle('hints')} />}
    />
  )
})
