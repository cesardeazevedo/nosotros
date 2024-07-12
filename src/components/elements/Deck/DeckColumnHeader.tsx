import { AccordionDetails, Box, Divider, IconButton, Typography, } from "@mui/material"
import { IconGripVertical, IconSettings, IconTrashX } from "@tabler/icons-react"
import React, { useCallback, useState } from "react"
import Accordion from "../Layouts/Accordion"
import { Row } from "../Layouts/Flex"
import Tooltip from "../Layouts/Tooltip"
import { deckStore } from "stores/ui/deck.store"

type Props = {
  id: string
  settings?: React.ReactElement
  children: React.ReactElement | React.ReactElement[]
}

function DeckColumnHeader(props: Props) {
  const [settings, setSettings] = useState(false)

  const handleDelete = useCallback(() => {
    deckStore.removeColumn(props.id)
  }, [props.id])

  return (
    <Accordion expanded={settings} variant='outlined' square disableGutters>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1000, left: 0, right: 0, backgroundColor: 'background.paper' }}>
        <Row sx={{ justifyContent: 'space-between', p: 2 }}>
          <Row>
            <Tooltip arrow title='Drag feed to a new position (coming soon)'>
              <IconButton size='small' sx={{ mr: 1, cursor: 'grab' }}>
                <IconGripVertical size={18} />
              </IconButton>
            </Tooltip>
            {props.children}
          </Row>
          <Tooltip arrow title='Feed Settings'>
            <IconButton size='small' onClick={() => setSettings(!settings)}>
              <IconSettings size={22} strokeWidth='2.0' />
            </IconButton>
          </Tooltip>
        </Row>
        <Divider />
      </Box>
      <AccordionDetails sx={{ p: 0 }}>
        <Row sx={{ px: 2, py: 1, justifyContent: 'space-between' }}>
          <Typography variant='h6'>Home Settings</Typography>
          <Tooltip arrow title='Delete column'>
            <IconButton color='error' onClick={handleDelete}><IconTrashX strokeWidth='1.4' size={20} /></IconButton>
          </Tooltip>
        </Row>
        {props.settings}
      </AccordionDetails>
    </Accordion>
  )
}

export default DeckColumnHeader
