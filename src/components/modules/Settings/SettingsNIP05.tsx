import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Switch } from '@/components/ui/Switch/Switch'
import { useSettings, useToggleSettings } from '@/hooks/useSettings'
import { memo } from 'react'

export const SettingsNIP05 = memo(function SettingsNIP05() {
  const settings = useSettings()
  const toggle = useToggleSettings()
  return (
    <MenuItem
      label='NIP05'
      // supportingText=''
      trailing={<Switch checked={settings.nip05} onChange={() => toggle('nip05')} />}
    />
  )
})
