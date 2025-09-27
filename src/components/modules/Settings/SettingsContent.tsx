import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Switch } from '@/components/ui/Switch/Switch'
import { useSettings, useToggleSettings } from '@/hooks/useSettings'

export const SettingsContent = () => {
  const settings = useSettings()
  const toggle = useToggleSettings()
  return (
    <MenuItem
      label='Auto Play Videos'
      htmlFor='autoplay'
      trailing={<Switch id='autoplay' checked={settings.autoPlay} onChange={() => toggle('autoPlay')} />}
    />
  )
}
