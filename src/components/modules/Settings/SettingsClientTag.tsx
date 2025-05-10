import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Switch } from '@/components/ui/Switch/Switch'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { observer } from 'mobx-react-lite'

export const SettingsClientTag = observer(function SettingsClientTag() {
  const settings = useGlobalSettings()
  return (
    <MenuItem
      label='Add Client Tag'
      supportingText='Allow other users to see you are using nosotros.app'
      trailing={<Switch checked={settings.clientTag} onChange={() => settings.toggle('clientTag')} />}
    />
  )
})
