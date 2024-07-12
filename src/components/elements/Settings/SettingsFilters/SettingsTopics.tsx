import { AccordionDetails, AccordionSummary } from "@mui/material"
import Accordion from "components/elements/Layouts/Accordion"

function SettingsTopics() {
  return (
    <Accordion>
      <AccordionSummary>
        Topics
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
      </AccordionDetails>
    </Accordion>
  )
}

export default SettingsTopics
