import { Box, Button, Divider } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import SettingsFilters from 'components/elements/Settings/SettingsFilters/SettingsFilters'
import SettingsRelays from 'components/elements/Settings/SettingsRelays'

function HomeSettings() {
  return (
    <Box sx={{ p: 0, pb: 0 }}>
      <Divider />
      <SettingsFilters />
      <SettingsRelays />
      <Divider />
      <Row sx={{ p: 1, justifyContent: 'space-between' }}>
        <Button>Reset</Button>
        <Button variant='contained' size='small'>
          Apply Filters
        </Button>
      </Row>
      <Divider />
    </Box>
  )
}

export default HomeSettings
