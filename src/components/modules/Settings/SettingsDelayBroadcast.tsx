import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Switch } from '@/components/ui/Switch/Switch'
import { useSettings, useToggleSettings } from '@/hooks/useSettings'

export const SettingsDelayBroadcast = () => {
  const settings = useSettings()
  const toggle = useToggleSettings()
  return (
    <MenuItem
      label='Delay note broadcast (undo)'
      supportingText='Delay broadcasts for 5 seconds when creating notes to allow undo.'
      htmlFor='broadcastdelay'
      trailing={
        <Switch id='broadcastdelay' checked={settings.delayBroadcast} onChange={() => toggle('delayBroadcast')} />
      }
    />
  )
}
