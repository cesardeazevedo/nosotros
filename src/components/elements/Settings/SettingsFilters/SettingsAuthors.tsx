import { AccordionDetails, AccordionSummary } from "@mui/material"
import Accordion from "components/elements/Layouts/Accordion"

function SettingsAuthors() {
  return (
    <Accordion>
      <AccordionSummary sx={{ ml: 2 }}>
        Authors
      </AccordionSummary>
      <AccordionDetails>
      </AccordionDetails>
    </Accordion>
  )
}

export default SettingsAuthors
