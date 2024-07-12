import { AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import Accordion from '../Layouts/Accordion'

function SettingsRelays() {
  return (
    <Accordion>
      <AccordionSummary>
        <Typography variant='subtitle2'>Relays</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0, border: 'none' }}></AccordionDetails>
    </Accordion>
  )
}

export default SettingsRelays
