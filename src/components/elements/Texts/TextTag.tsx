import { Link } from '@mui/material'

type Props = {
  content: string
}

function TextTag(props: Props) {
  return (
    <>
      <Link color='primary'>{props.content}</Link>
    </>
  )
}

export default TextTag
