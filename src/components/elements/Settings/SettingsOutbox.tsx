import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Switch } from '@/components/ui/Switch/Switch'
import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import { observer } from 'mobx-react-lite'

export const SettingsOutbox = observer(function SettingsOutbox() {
  const settings = useGlobalNostrSettings()
  return (
    <MenuItem
      label='Outbox'
      supportingText='The outbox model helps you find notes from others people relays'
      trailing={<Switch checked={settings.outbox} onChange={() => settings.toggle('outbox')} />}
    />
  )
})
