import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Switch } from '@/components/ui/Switch/Switch'
import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import { observer } from 'mobx-react-lite'

export const SettingsNIP05 = observer(function SettingsOutbox() {
  const settings = useGlobalNostrSettings()
  return (
    <MenuItem
      label='NIP05'
      // supportingText=''
      trailing={<Switch checked={settings.nip05} onChange={() => settings.toggle('nip05')} />}
    />
  )
})
