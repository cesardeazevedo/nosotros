import { AccordionDetails, AccordionSummary } from '@mui/material'
import Accordion from 'components/elements/Layouts/Accordion'

function SettingsDateRange() {
  return (
    <Accordion>
      <AccordionSummary>Date Range</AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}></AccordionDetails>
    </Accordion>
  )
}

export default SettingsDateRange
