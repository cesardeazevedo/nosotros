import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Switch } from '@/components/ui/Switch/Switch'
import { useSettings, useToggleSettings } from '@/hooks/useSettings'
import { memo } from 'react'

export const SettingsClientTag = memo(function SettingsClientTag() {
  const settings = useSettings()
  const toggle = useToggleSettings()
  return (
    <MenuItem
      label='Add Client Tag'
      supportingText='Allow other users to see you are using nosotros.app'
      trailing={<Switch checked={settings.clientTag} onChange={() => toggle('clientTag')} />}
    />
  )
})
