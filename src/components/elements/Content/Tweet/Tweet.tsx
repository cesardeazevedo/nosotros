import { Box } from '@mui/material'
import { Tweet as ReactTweet } from 'react-tweet'

export type Props = {
  src: string
}

function Tweet(props: Props) {
  const { src } = props
  const id = src.slice(src.lastIndexOf('/') + 1)

  return (
    <Box sx={{ mx: 2 }}>
      <ReactTweet id={id} />
    </Box>
  )
}

export default Tweet
