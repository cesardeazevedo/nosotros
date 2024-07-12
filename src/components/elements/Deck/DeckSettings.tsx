import { Box } from "@mui/material"
import React from "react"

type Props = {
  children: React.ReactElement
}

function DeckSettings(props: Props) {
  return (
    <Box sx={{ height: 300 }}>
      {props.children}
    </Box>
  )
}

export default DeckSettings
