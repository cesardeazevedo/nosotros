import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Switch } from '@/components/ui/Switch/Switch'
import { useSettings, useToggleSettings } from '@/hooks/useSettings'

export const SettingsLayout = function SettingsLayout() {
  const settings = useSettings()
  const toggle = useToggleSettings()
  return (
    <>
      <MenuItem
        label='Compact notifications layout'
        trailing={<Switch checked={settings.notificationsCompact} onChange={() => toggle('notificationsCompact')} />}
      />
    </>
  )
}
