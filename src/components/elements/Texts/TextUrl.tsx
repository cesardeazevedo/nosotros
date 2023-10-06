import { Link } from '@mui/material'

type Props = {
  href?: string
  content: string
}

function TextUrl(props: Props) {
  return (
    <Link href={props.href} color='primary' target='_blank' rel='noopener noreferrer'>
      {props.content}
    </Link>
  )
}

export default TextUrl
