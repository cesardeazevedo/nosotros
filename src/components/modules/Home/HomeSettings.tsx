import { Box, Divider } from '@mui/material'
import SettingsFilters from 'components/elements/Settings/SettingsFilters/SettingsFilters'
import SettingsRelays from 'components/elements/Settings/SettingsRelays'

function HomeSettings() {
  return (
    <Box sx={{ p: 0, pb: 0 }}>
      <Divider />
      <SettingsFilters />
      <SettingsRelays />
      <Divider />
    </Box>
  )
}

export default HomeSettings
