import { AccordionDetails, AccordionSummary, Divider, Typography } from '@mui/material'
import Accordion from 'components/elements/Layouts/Accordion'
import SettingsAuthors from './SettingsAuthors'
import SettingsKinds from './SettingsKinds'

function SettingsFilters() {
  return (
    <Accordion>
      <AccordionSummary>
        <Typography variant='subtitle2'>Filters</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0, '>div': { background: 'transparent' } }}>
        <Divider />
        <SettingsKinds />
        <SettingsAuthors />
      </AccordionDetails>
    </Accordion>
  )
}

export default SettingsFilters
