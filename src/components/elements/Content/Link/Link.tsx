import { Link as MuiLink } from '@mui/material'

type Props = {
  href?: string
  children: React.ReactNode
}

function Link(props: Props) {
  return (
    <MuiLink href={props.href} color='primary' target='_blank' rel='noopener noreferrer'>
      {props.children}
    </MuiLink>
  )
}

export default Link
