import { Divider } from '@/components/ui/Divider/Divider'
import { SettingsAuthors } from './SettingsAuthors'
import { SettingsHeader } from './SettingsHeader'
import { SettingsKinds } from './SettingsKinds'

export const SettingsFilters = () => {
  return (
    <SettingsHeader label='Filters'>
      <Divider />
      <SettingsKinds />
      <SettingsAuthors />
    </SettingsHeader>
  )
}
