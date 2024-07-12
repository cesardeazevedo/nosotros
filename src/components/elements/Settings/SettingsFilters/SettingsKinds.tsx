import { AccordionDetails, AccordionSummary } from "@mui/material"
import Accordion from "components/elements/Layouts/Accordion"

function SettingsKinds() {
  return (
    <Accordion>
      <AccordionSummary sx={{ ml: 2 }}>
        kinds
      </AccordionSummary>
      <AccordionDetails sx={{ border: 'none' }}>
      </AccordionDetails>
    </Accordion>
  )
}

export default SettingsKinds
