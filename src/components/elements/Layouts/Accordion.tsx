import type { AccordionProps } from '@mui/material'
import { Accordion as MuiAccordion } from '@mui/material'

function Accordion(props: AccordionProps) {
  return (
    <MuiAccordion
      square
      disableGutters
      variant='outlined'
      {...props}
      sx={{
        '&:before': {
          border: 'none',
          opacity: '1!important',
        },
        border: 'none',
        ...props.sx,
      }}
    />
  )
}

export default Accordion
